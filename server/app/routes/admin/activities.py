from flask import jsonify, request

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@admin_blueprint.get("/activities", endpoint="list_activities")
@require_role("admin")
def list_activities():
    """List all activities with optional filters."""
    filters = {
        "weekday": request.args.get("weekday") or None,
        "group_name": request.args.get("group") or None,
        "modality": request.args.get("modality") or None,
    }

    try:
        activities = sql_queries.fetch_all("queries/staff/activities.sql", filters)
        return jsonify({
            "success": True,
            "activities": activities,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar atividades: {str(e)}"}), 500


@admin_blueprint.post("/activities", endpoint="create_activity")
@require_role("admin")
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


@admin_blueprint.put("/activities/<int:activity_id>", endpoint="update_activity")
@require_role("admin")
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


@admin_blueprint.delete("/activities/<int:activity_id>", endpoint="delete_activity")
@require_role("admin")
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


@admin_blueprint.get("/activities/<int:activity_id>", endpoint="get_activity")
@require_role("admin")
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
