from flask import g, jsonify, request, session

from app.routes.external import external_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_external_auth


@external_blueprint.get("/dashboard", endpoint="dashboard")
@require_external_auth()
def dashboard():
    """Get invite information and related data for external user."""
    invite_id = session.get("invite_id")
    if not invite_id:
        return jsonify({"success": False, "message": "Sessão inválida"}), 401

    # Get invite information
    invite = sql_queries.fetch_one(
        "queries/external/get_invite_by_token.sql",
        {"token": session.get("external_token")},
    )

    if not invite:
        return jsonify({"success": False, "message": "Convite não encontrado"}), 404

    # Update session with current status from database
    invite_status = invite.get("status")
    session["invite_status"] = invite_status

    # Log para debug
    from flask import current_app
    current_app.logger.info(f"Dashboard: Convite ID {invite_id}, Status: {invite_status}")

    # Get participation if invite is accepted
    participation = None
    if invite_status == "ACEITO":
        participation = sql_queries.fetch_one(
            "queries/external/get_invite_participation.sql",
            {"invite_id": invite_id},
        )

    return jsonify({
        "success": True,
        "invite": invite,
        "participation": participation,
    })


@external_blueprint.post("/accept", endpoint="accept_invite")
@require_external_auth()
def accept_invite():
    """Accept an external invite."""
    invite_id = session.get("invite_id")
    if not invite_id:
        return jsonify({"success": False, "message": "Sessão inválida"}), 401

    # Get current invite status from database
    invite = sql_queries.fetch_one(
        "queries/external/get_invite_by_token.sql",
        {"token": session.get("external_token")},
    )

    if not invite:
        return jsonify({"success": False, "message": "Convite não encontrado"}), 404

    # Use the invite_id from the database query instead of session to ensure it's correct
    db_invite_id = invite.get("id_convite")
    if not db_invite_id:
        return jsonify({"success": False, "message": "ID do convite inválido"}), 400

    # Log para debug
    from flask import current_app
    current_app.logger.info(f"Accept: Session invite_id={invite_id}, DB invite_id={db_invite_id}")

    # Check if invite is actually pending
    # Return 200 with success: false for business logic errors
    if invite.get("status") != "PENDENTE":
        return jsonify({"success": False, "message": "Convite não está pendente"}), 200

    # Use the invite_id from database to ensure it's correct
    result = sql_queries.fetch_one(
        "queries/external/accept_invite.sql",
        {"invite_id": db_invite_id},
    )

    if not result or not result.get("result"):
        # Rollback on error
        if hasattr(g, 'db_session') and g.db_session:
            g.db_session.connection.rollback()
        return jsonify({"success": False, "message": "Erro ao processar aceitação"}), 500

    accept_data = result["result"]

    # Return 200 with success: false for business logic errors (like no available spots)
    # This prevents the error from appearing in the console as an exception
    if not accept_data.get("success"):
        # Rollback on business logic error
        if hasattr(g, 'db_session') and g.db_session:
            g.db_session.connection.rollback()
        return jsonify({
            "success": False,
            "message": accept_data.get("message", "Erro ao aceitar convite")
        }), 200

    # Commit the transaction after executing the function that modifies the database
    if hasattr(g, 'db_session') and g.db_session:
        g.db_session.connection.commit()

    # Get updated invite status from database to ensure it's current
    updated_invite = sql_queries.fetch_one(
        "queries/external/get_invite_by_token.sql",
        {"token": session.get("external_token")},
    )

    if updated_invite:
        # Update session with current status and invite_id from database
        new_status = updated_invite.get("status", "ACEITO")
        updated_invite_id = updated_invite.get("id_convite")
        session["invite_status"] = new_status
        if updated_invite_id:
            session["invite_id"] = updated_invite_id

        # Log para debug
        from flask import current_app
        current_app.logger.info(f"Accept: Convite ID {db_invite_id}, Status atualizado para: {new_status}")
    else:
        session["invite_status"] = "ACEITO"
        from flask import current_app
        current_app.logger.warning(f"Accept: Convite ID {db_invite_id}, não foi possível buscar status atualizado")

    return jsonify({
        "success": True,
        "message": accept_data.get("message", "Convite aceito com sucesso"),
    })


@external_blueprint.post("/reject", endpoint="reject_invite")
@require_external_auth()
def reject_invite():
    """Reject an external invite."""
    invite_id = session.get("invite_id")
    if not invite_id:
        return jsonify({"success": False, "message": "Sessão inválida"}), 401

    # Get current invite status from database
    invite = sql_queries.fetch_one(
        "queries/external/get_invite_by_token.sql",
        {"token": session.get("external_token")},
    )

    if not invite:
        return jsonify({"success": False, "message": "Convite não encontrado"}), 404

    # Use the invite_id from the database query instead of session to ensure it's correct
    db_invite_id = invite.get("id_convite")
    if not db_invite_id:
        return jsonify({"success": False, "message": "ID do convite inválido"}), 400

    # Log para debug
    from flask import current_app
    current_app.logger.info(f"Reject: Session invite_id={invite_id}, DB invite_id={db_invite_id}")

    # Check if invite is actually pending
    # Return 200 with success: false for business logic errors
    if invite.get("status") != "PENDENTE":
        return jsonify({"success": False, "message": "Convite não está pendente"}), 200

    # Use the invite_id from database to ensure it's correct
    result = sql_queries.fetch_one(
        "queries/external/reject_invite.sql",
        {"invite_id": db_invite_id},
    )

    if not result or not result.get("result"):
        # Rollback on error
        if hasattr(g, 'db_session') and g.db_session:
            g.db_session.connection.rollback()
        return jsonify({"success": False, "message": "Erro ao processar recusa"}), 500

    reject_data = result["result"]

    # Return 200 with success: false for business logic errors
    # This prevents the error from appearing in the console as an exception
    if not reject_data.get("success"):
        # Rollback on business logic error
        if hasattr(g, 'db_session') and g.db_session:
            g.db_session.connection.rollback()
        return jsonify({
            "success": False,
            "message": reject_data.get("message", "Erro ao recusar convite")
        }), 200

    # Commit the transaction after executing the function that modifies the database
    if hasattr(g, 'db_session') and g.db_session:
        g.db_session.connection.commit()

    # Get updated invite status from database to ensure it's current
    updated_invite = sql_queries.fetch_one(
        "queries/external/get_invite_by_token.sql",
        {"token": session.get("external_token")},
    )

    if updated_invite:
        # Update session with current status and invite_id from database
        new_status = updated_invite.get("status", "RECUSADO")
        updated_invite_id = updated_invite.get("id_convite")
        session["invite_status"] = new_status
        if updated_invite_id:
            session["invite_id"] = updated_invite_id

        # Log para debug
        from flask import current_app
        current_app.logger.info(f"Reject: Convite ID {db_invite_id}, Status atualizado para: {new_status}")
    else:
        session["invite_status"] = "RECUSADO"
        from flask import current_app
        current_app.logger.warning(f"Reject: Convite ID {db_invite_id}, não foi possível buscar status atualizado")

    return jsonify({
        "success": True,
        "message": reject_data.get("message", "Convite recusado"),
    })
