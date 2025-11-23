import secrets
from flask import jsonify, request, session

from app.routes.internal import internal_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@internal_blueprint.get("/", endpoint="dashboard")
@require_role("internal", "staff", "admin")
def dashboard():
    cpf = request.args.get("cpf") or ""
    reservas_instalacoes = []
    reservas_equipamentos = []
    if cpf:
        reservas_instalacoes = sql_queries.fetch_all(
            "queries/internal/reservas_por_interno.sql",
            {"cpf": cpf},
        )
        reservas_equipamentos = sql_queries.fetch_all(
            "queries/internal/reservas_equipamentos_por_interno.sql",
            {"cpf": cpf},
        )

    date_param = request.args.get("date") or None
    start_param = request.args.get("start") or None
    end_param = request.args.get("end") or None

    available_installs: list[dict[str, str]] = []
    available_equipment: list[dict[str, str]] = []
    if date_param and start_param and end_param:
        available_installs = sql_queries.fetch_all(
            "queries/internal/instalacoes_disponiveis.sql",
            {
                "date": date_param,
                "start": start_param,
                "end": end_param,
            },
        )
        available_equipment = sql_queries.fetch_all(
            "queries/internal/equipamentos_disponiveis.sql",
            {
                "date": date_param,
                "start": start_param,
                "end": end_param,
            },
        )

    return jsonify({
        "success": True,
        "cpf": cpf,
        "reservas": reservas_instalacoes,
        "reservas_equipamentos": reservas_equipamentos,
        "date_filter": date_param,
        "start_filter": start_param,
        "end_filter": end_param,
        "available_installs": available_installs,
        "available_equipment": available_equipment,
    })


@internal_blueprint.get("/activities", endpoint="activities")
@require_role("internal", "staff", "admin")
def list_activities():
    """List available activities with optional filters."""
    weekday = request.args.get("weekday") or None
    group_name = request.args.get("group_name") or None
    modality = request.args.get("modality") or None

    activities = sql_queries.fetch_all(
        "queries/internal/atividades_disponiveis.sql",
        {
            "weekday": weekday,
            "group_name": group_name,
            "modality": modality,
        },
    )

    return jsonify({
        "success": True,
        "activities": activities,
    })


@internal_blueprint.post("/activities/enroll", endpoint="enroll_activity")
@require_role("internal", "staff", "admin")
def enroll_activity():
    """Enroll in an activity."""
    cpf_participante = session.get("user_id")
    if not cpf_participante:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_atividade = data.get("id_atividade")
    else:
        id_atividade = request.form.get("id_atividade")

    if not id_atividade:
        return jsonify({"success": False, "message": "ID da atividade é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/inscrever_em_atividade.sql",
            {
                "cpf_participante": cpf_participante,
                "id_atividade": int(id_atividade),
            },
        )
        return jsonify({
            "success": True,
            "message": "Inscrição realizada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "já está inscrito" in error_message.lower():
            return jsonify({"success": False, "message": "Você já está inscrito nesta atividade"}), 400
        if "vagas esgotadas" in error_message.lower():
            return jsonify({"success": False, "message": "As vagas para esta atividade estão esgotadas"}), 400
        return jsonify({"success": False, "message": f"Erro ao inscrever: {error_message}"}), 500


@internal_blueprint.post("/reservations/installation", endpoint="reserve_installation")
@require_role("internal", "staff", "admin")
def reserve_installation():
    """Reserve an installation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_instalacao = data.get("id_instalacao")
        data_reserva = data.get("data")
        hora_inicio = data.get("hora_inicio")
        hora_fim = data.get("hora_fim")
    else:
        id_instalacao = request.form.get("id_instalacao")
        data_reserva = request.form.get("data")
        hora_inicio = request.form.get("hora_inicio")
        hora_fim = request.form.get("hora_fim")

    if not all([id_instalacao, data_reserva, hora_inicio, hora_fim]):
        return jsonify({"success": False, "message": "Todos os campos são obrigatórios"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/reservar_instalacao.sql",
            {
                "id_instalacao": int(id_instalacao),
                "cpf_responsavel": cpf_responsavel,
                "data": data_reserva,
                "hora_inicio": hora_inicio,
                "hora_fim": hora_fim,
            },
        )
        return jsonify({
            "success": True,
            "message": "Reserva realizada com sucesso",
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao reservar instalação: {str(e)}"}), 500


@internal_blueprint.post("/reservations/equipment", endpoint="reserve_equipment")
@require_role("internal", "staff", "admin")
def reserve_equipment():
    """Reserve equipment."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_equipamento = data.get("id_equipamento")
        data_reserva = data.get("data")
        hora_inicio = data.get("hora_inicio")
        hora_fim = data.get("hora_fim")
    else:
        id_equipamento = request.form.get("id_equipamento")
        data_reserva = request.form.get("data")
        hora_inicio = request.form.get("hora_inicio")
        hora_fim = request.form.get("hora_fim")

    if not all([id_equipamento, data_reserva, hora_inicio, hora_fim]):
        return jsonify({"success": False, "message": "Todos os campos são obrigatórios"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/reservar_equipamento.sql",
            {
                "id_equipamento": id_equipamento,
                "cpf_responsavel": cpf_responsavel,
                "data": data_reserva,
                "hora_inicio": hora_inicio,
                "hora_fim": hora_fim,
            },
        )
        return jsonify({
            "success": True,
            "message": "Reserva de equipamento realizada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não é reservável" in error_message.lower():
            return jsonify({"success": False, "message": "Este equipamento não é reservável"}), 400
        if "horário de fim deve ser maior" in error_message.lower() or "ck_reserva_equip_horario" in error_message.lower():
            return jsonify({"success": False, "message": "O horário de fim deve ser maior que o horário de início"}), 400
        return jsonify({"success": False, "message": f"Erro ao reservar equipamento: {error_message}"}), 500


@internal_blueprint.get("/equipment", endpoint="list_equipment")
@require_role("internal", "staff", "admin")
def list_equipment():
    """List available equipment for reservation."""
    equipment = sql_queries.fetch_all(
        "queries/internal/listar_equipamentos_disponiveis.sql",
    )

    return jsonify({
        "success": True,
        "equipment": equipment,
    })


@internal_blueprint.get("/invites", endpoint="list_invites")
@require_role("internal", "staff", "admin")
def list_invites():
    """List invites created by the current internal user."""
    cpf_convidante = session.get("user_id")
    if not cpf_convidante:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    invites = sql_queries.fetch_all(
        "queries/internal/convites_por_interno.sql",
        {"cpf_convidante": cpf_convidante},
    )

    return jsonify({
        "success": True,
        "invites": invites,
    })


@internal_blueprint.post("/invites", endpoint="create_invite")
@require_role("internal", "staff", "admin")
def create_invite():
    """Create a new external invite."""
    cpf_convidante = session.get("user_id")
    if not cpf_convidante:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        documento_convidado = data.get("documento_convidado", "").strip()
        nome_convidado = data.get("nome_convidado", "").strip()
        email_convidado = data.get("email_convidado", "").strip() or None
        telefone_convidado = data.get("telefone_convidado", "").strip() or None
        id_atividade = data.get("id_atividade") or None
        observacoes = data.get("observacoes", "").strip() or None
    else:
        documento_convidado = request.form.get("documento_convidado", "").strip()
        nome_convidado = request.form.get("nome_convidado", "").strip()
        email_convidado = request.form.get("email_convidado", "").strip() or None
        telefone_convidado = request.form.get("telefone_convidado", "").strip() or None
        id_atividade = request.form.get("id_atividade") or None
        observacoes = request.form.get("observacoes", "").strip() or None

    if not documento_convidado or not nome_convidado:
        return jsonify({"success": False, "message": "Documento e nome do convidado são obrigatórios"}), 400

    # Generate unique token
    token = secrets.token_hex(32)

    try:
        result = sql_queries.fetch_one(
            "queries/internal/criar_convite_externo.sql",
            {
                "cpf_convidante": cpf_convidante,
                "documento_convidado": documento_convidado,
                "nome_convidado": nome_convidado,
                "email_convidado": email_convidado,
                "telefone_convidado": telefone_convidado,
                "id_atividade": int(id_atividade) if id_atividade else None,
                "token": token,
                "observacoes": observacoes,
            },
        )

        if result:
            return jsonify({
                "success": True,
                "message": "Convite criado com sucesso",
                "invite": {
                    "id_convite": result["id_convite"],
                    "token": token,
                    "status": result["status"],
                },
            })
        else:
            return jsonify({"success": False, "message": "Erro ao criar convite"}), 500

    except Exception as e:
        error_message = str(e)
        if "unique" in error_message.lower() or "duplicate" in error_message.lower():
            # Token collision - very unlikely, but try again
            token = secrets.token_hex(32)
            try:
                result = sql_queries.fetch_one(
                    "queries/internal/criar_convite_externo.sql",
                    {
                        "cpf_convidante": cpf_convidante,
                        "documento_convidado": documento_convidado,
                        "nome_convidado": nome_convidado,
                        "email_convidado": email_convidado,
                        "telefone_convidado": telefone_convidado,
                        "id_atividade": int(id_atividade) if id_atividade else None,
                        "token": token,
                        "observacoes": observacoes,
                    },
                )
                if result:
                    return jsonify({
                        "success": True,
                        "message": "Convite criado com sucesso",
                        "invite": {
                            "id_convite": result["id_convite"],
                            "token": token,
                            "status": result["status"],
                        },
                    })
            except Exception:
                pass

        return jsonify({"success": False, "message": f"Erro ao criar convite: {error_message}"}), 500


@internal_blueprint.delete("/reservations/installation/<int:reservation_id>", endpoint="cancel_installation_reservation")
@require_role("internal", "staff", "admin")
def cancel_installation_reservation(reservation_id: int):
    """Cancel an installation reservation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    try:
        # Verify that the reservation belongs to the current user
        reservation = sql_queries.fetch_one(
            "queries/internal/verificar_reserva_instalacao.sql",
            {
                "id_reserva": reservation_id,
                "cpf_responsavel": cpf_responsavel,
            },
        )

        if not reservation:
            return jsonify({"success": False, "message": "Reserva não encontrada ou você não tem permissão para cancelá-la"}), 403

        # Cancel the reservation
        sql_queries.execute_statement(
            "queries/staff/cancelar_reserva_instalacao.sql",
            {"id_reserva": reservation_id},
        )
        return jsonify({
            "success": True,
            "message": "Reserva de instalação cancelada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Reserva não encontrada"}), 404
        return jsonify({"success": False, "message": f"Erro ao cancelar reserva: {error_message}"}), 500


@internal_blueprint.delete("/reservations/equipment/<int:reservation_id>", endpoint="cancel_equipment_reservation")
@require_role("internal", "staff", "admin")
def cancel_equipment_reservation(reservation_id: int):
    """Cancel an equipment reservation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    try:
        # Verify that the reservation belongs to the current user
        reservation = sql_queries.fetch_one(
            "queries/internal/verificar_reserva_equipamento.sql",
            {
                "id_reserva_equip": reservation_id,
                "cpf_responsavel": cpf_responsavel,
            },
        )

        if not reservation:
            return jsonify({"success": False, "message": "Reserva não encontrada ou você não tem permissão para cancelá-la"}), 403

        # Cancel the reservation
        sql_queries.execute_statement(
            "queries/staff/cancelar_reserva_equipamento.sql",
            {"id_reserva_equip": reservation_id},
        )
        return jsonify({
            "success": True,
            "message": "Reserva de equipamento cancelada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Reserva não encontrada"}), 404
        return jsonify({"success": False, "message": f"Erro ao cancelar reserva: {error_message}"}), 500
