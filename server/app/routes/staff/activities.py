from flask import jsonify, request

from app.routes.staff import staff_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@staff_blueprint.get("/activities/<int:activity_id>/participants", endpoint="list_activity_participants")
@require_role("staff", "admin")
def list_activity_participants(activity_id: int):
    """List participants of a specific activity."""
    try:
        participants = sql_queries.fetch_all(
            "queries/staff/listar_participantes_atividade.sql",
            {"id_atividade": activity_id},
        )
        return jsonify({
            "success": True,
            "participants": participants,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar participantes: {str(e)}"}), 500


@staff_blueprint.post("/activities/<int:activity_id>/participants", endpoint="add_activity_participant")
@require_role("staff", "admin")
def add_activity_participant(activity_id: int):
    """Add a participant to an activity."""
    if request.is_json:
        data = request.json
        cpf_participante = data.get("cpf_participante", "").strip()
    else:
        cpf_participante = request.form.get("cpf_participante", "").strip()

    if not cpf_participante:
        return jsonify({"success": False, "message": "CPF do participante é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/inscrever_em_atividade.sql",
            {
                "cpf_participante": cpf_participante,
                "id_atividade": activity_id,
            },
        )
        return jsonify({
            "success": True,
            "message": "Participante inscrito com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "já está inscrito" in error_message.lower():
            return jsonify({"success": False, "message": "O participante já está inscrito nesta atividade"}), 400
        if "vagas esgotadas" in error_message.lower():
            return jsonify({"success": False, "message": "As vagas para esta atividade estão esgotadas"}), 400
        return jsonify({"success": False, "message": f"Erro ao inscrever participante: {error_message}"}), 500


@staff_blueprint.delete("/activities/<int:activity_id>/participants/<cpf>", endpoint="remove_activity_participant")
@require_role("staff", "admin")
def remove_activity_participant(activity_id: int, cpf: str):
    """Remove a participant from an activity."""
    try:
        sql_queries.execute_statement(
            "queries/staff/remover_participante_atividade.sql",
            {
                "cpf_participante": cpf,
                "id_atividade": activity_id,
            },
        )
        return jsonify({
            "success": True,
            "message": "Participante removido com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Participante não encontrado nesta atividade"}), 404
        return jsonify({"success": False, "message": f"Erro ao remover participante: {error_message}"}), 500


@staff_blueprint.post("/activities", endpoint="create_activity")
@require_role("staff", "admin")
def create_activity():
    """Create a new activity."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        vagas = data.get("vagas")
        data_inicio = data.get("data_inicio")
        data_fim = data.get("data_fim")
    else:
        nome = request.form.get("nome", "").strip()
        vagas = request.form.get("vagas")
        data_inicio = request.form.get("data_inicio")
        data_fim = request.form.get("data_fim")

    if not nome:
        return jsonify({"success": False, "message": "Nome da atividade é obrigatório"}), 400
    if vagas is None:
        return jsonify({"success": False, "message": "Número de vagas é obrigatório"}), 400
    if not data_inicio:
        return jsonify({"success": False, "message": "Data de início é obrigatória"}), 400
    if not data_fim:
        return jsonify({"success": False, "message": "Data de fim é obrigatória"}), 400

    try:
        sql_queries.execute_statement(
            "queries/staff/criar_atividade.sql",
            {
                "nome": nome,
                "vagas": int(vagas),
                "data_inicio": data_inicio,
                "data_fim": data_fim,
            },
        )
        return jsonify({
            "success": True,
            "message": "Atividade criada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "data de término" in error_message.lower():
            return jsonify({"success": False, "message": "A data de término não pode ser anterior à data de início"}), 400
        return jsonify({"success": False, "message": f"Erro ao criar atividade: {error_message}"}), 500


@staff_blueprint.put("/activities/<int:activity_id>", endpoint="update_activity")
@require_role("staff", "admin")
def update_activity(activity_id: int):
    """Update an activity."""
    if request.is_json:
        data = request.json
        novo_nome = data.get("nome", "").strip()
        novas_vagas = data.get("vagas")
    else:
        novo_nome = request.form.get("nome", "").strip()
        novas_vagas = request.form.get("vagas")

    if not novo_nome:
        return jsonify({"success": False, "message": "Nome da atividade é obrigatório"}), 400
    if novas_vagas is None:
        return jsonify({"success": False, "message": "Número de vagas é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/staff/atualizar_atividade.sql",
            {
                "id_atividade": activity_id,
                "novo_nome": novo_nome,
                "novas_vagas": int(novas_vagas),
            },
        )
        return jsonify({
            "success": True,
            "message": "Atividade atualizada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Atividade não encontrada"}), 404
        return jsonify({"success": False, "message": f"Erro ao atualizar atividade: {error_message}"}), 500


@staff_blueprint.delete("/activities/<int:activity_id>", endpoint="delete_activity")
@require_role("staff", "admin")
def delete_activity(activity_id: int):
    """Delete an activity."""
    try:
        sql_queries.execute_statement(
            "queries/staff/deletar_atividade.sql",
            {"id_atividade": activity_id},
        )
        return jsonify({
            "success": True,
            "message": "Atividade deletada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Atividade não encontrada"}), 404
        return jsonify({"success": False, "message": f"Erro ao deletar atividade: {error_message}"}), 500


@staff_blueprint.get("/activities/<int:activity_id>", endpoint="get_activity")
@require_role("staff", "admin")
def get_activity(activity_id: int):
    """Get details of a specific activity."""
    try:
        activity = sql_queries.fetch_one(
            "queries/staff/buscar_atividade.sql",
            {"id_atividade": activity_id},
        )
        if not activity:
            return jsonify({"success": False, "message": "Atividade não encontrada"}), 404
        return jsonify({
            "success": True,
            "activity": activity,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar atividade: {str(e)}"}), 500
