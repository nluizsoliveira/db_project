from flask import jsonify, request

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@admin_blueprint.get("/equipment", endpoint="list_equipment")
@require_role("admin")
def list_equipment():
    """List all equipment."""
    try:
        equipment = sql_queries.fetch_all("queries/admin/listar_equipamentos.sql")
        return jsonify({
            "success": True,
            "equipment": equipment,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar equipamentos: {str(e)}"}), 500


@admin_blueprint.get("/equipment/<equipment_id>", endpoint="get_equipment")
@require_role("admin")
def get_equipment(equipment_id: str):
    """Get details of a specific equipment."""
    try:
        equipment = sql_queries.fetch_one(
            "queries/admin/buscar_equipamento.sql",
            {"id_patrimonio": equipment_id},
        )
        if not equipment:
            return jsonify({"success": False, "message": "Equipamento não encontrado"}), 404
        return jsonify({
            "success": True,
            "equipment": equipment,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar equipamento: {str(e)}"}), 500


@admin_blueprint.post("/equipment", endpoint="create_equipment")
@require_role("admin")
def create_equipment():
    """Create a new equipment."""
    if request.is_json:
        data = request.json
        id_patrimonio = data.get("id_patrimonio", "").strip()
        nome = data.get("nome", "").strip()
        id_instalacao = data.get("id_instalacao")
        preco = data.get("preco")
        data_aquisicao = data.get("data_aquisicao")
        eh_reservavel = data.get("eh_reservavel", "N")
    else:
        id_patrimonio = request.form.get("id_patrimonio", "").strip()
        nome = request.form.get("nome", "").strip()
        id_instalacao = request.form.get("id_instalacao")
        preco = request.form.get("preco")
        data_aquisicao = request.form.get("data_aquisicao")
        eh_reservavel = request.form.get("eh_reservavel", "N")

    if not id_patrimonio:
        return jsonify({"success": False, "message": "ID de patrimônio é obrigatório"}), 400
    if not nome:
        return jsonify({"success": False, "message": "Nome do equipamento é obrigatório"}), 400
    if eh_reservavel not in ["S", "N"]:
        return jsonify({"success": False, "message": "eh_reservavel deve ser 'S' ou 'N'"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/criar_equipamento.sql",
            {
                "id_patrimonio": id_patrimonio,
                "nome": nome,
                "id_instalacao": int(id_instalacao) if id_instalacao else None,
                "preco": float(preco) if preco else None,
                "data_aquisicao": data_aquisicao if data_aquisicao else None,
                "eh_reservavel": eh_reservavel,
            },
        )
        return jsonify({
            "success": True,
            "message": "Equipamento criado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        return jsonify({"success": False, "message": f"Erro ao criar equipamento: {error_message}"}), 500


@admin_blueprint.put("/equipment/<equipment_id>", endpoint="update_equipment")
@require_role("admin")
def update_equipment(equipment_id: str):
    """Update an equipment."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        id_instalacao = data.get("id_instalacao")
        eh_reservavel = data.get("eh_reservavel", "N")
    else:
        nome = request.form.get("nome", "").strip()
        id_instalacao = request.form.get("id_instalacao")
        eh_reservavel = request.form.get("eh_reservavel", "N")

    if not nome:
        return jsonify({"success": False, "message": "Nome do equipamento é obrigatório"}), 400
    if eh_reservavel not in ["S", "N"]:
        return jsonify({"success": False, "message": "eh_reservavel deve ser 'S' ou 'N'"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/atualizar_equipamento.sql",
            {
                "id_patrimonio": equipment_id,
                "nome": nome,
                "id_instalacao": int(id_instalacao) if id_instalacao else None,
                "eh_reservavel": eh_reservavel,
            },
        )
        return jsonify({
            "success": True,
            "message": "Equipamento atualizado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Equipamento não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao atualizar equipamento: {error_message}"}), 500


@admin_blueprint.delete("/equipment/<equipment_id>", endpoint="delete_equipment")
@require_role("admin")
def delete_equipment(equipment_id: str):
    """Delete an equipment."""
    try:
        sql_queries.execute_statement(
            "queries/admin/deletar_equipamento.sql",
            {"id": equipment_id},
        )
        return jsonify({
            "success": True,
            "message": "Equipamento deletado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Equipamento não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao deletar equipamento: {error_message}"}), 500
