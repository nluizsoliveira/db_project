from flask import jsonify, request

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role
from app.services.error_handler import simplify_database_error


@admin_blueprint.get("/installations", endpoint="list_installations")
@require_role("admin")
def list_installations():
    """List all installations."""
    try:
        installations = sql_queries.fetch_all("queries/admin/listar_instalacoes.sql")
        return jsonify({
            "success": True,
            "installations": installations,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar instalações: {str(e)}"}), 500


@admin_blueprint.get("/installations/<int:installation_id>", endpoint="get_installation")
@require_role("admin")
def get_installation(installation_id: int):
    """Get details of a specific installation."""
    try:
        installation = sql_queries.fetch_one(
            "queries/admin/buscar_instalacao.sql",
            {"id_instalacao": installation_id},
        )
        if not installation:
            return jsonify({"success": False, "message": "Instalação não encontrada"}), 404
        return jsonify({
            "success": True,
            "installation": installation,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar instalação: {str(e)}"}), 500


@admin_blueprint.post("/installations", endpoint="create_installation")
@require_role("admin")
def create_installation():
    """Create a new installation."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        tipo = data.get("tipo", "").strip()
        capacidade = data.get("capacidade")
        eh_reservavel = data.get("eh_reservavel", "N")
    else:
        nome = request.form.get("nome", "").strip()
        tipo = request.form.get("tipo", "").strip()
        capacidade = request.form.get("capacidade")
        eh_reservavel = request.form.get("eh_reservavel", "N")

    if not nome:
        return jsonify({"success": False, "message": "Nome da instalação é obrigatório"}), 400
    if not tipo:
        return jsonify({"success": False, "message": "Tipo da instalação é obrigatório"}), 400
    if capacidade is None:
        return jsonify({"success": False, "message": "Capacidade é obrigatória"}), 400
    if eh_reservavel not in ["S", "N"]:
        return jsonify({"success": False, "message": "eh_reservavel deve ser 'S' ou 'N'"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/criar_instalacao.sql",
            {
                "nome": nome,
                "tipo": tipo,
                "capacidade": int(capacidade),
                "eh_reservavel": eh_reservavel,
            },
        )
        return jsonify({
            "success": True,
            "message": "Instalação criada com sucesso",
        })
    except Exception as e:
        error_message = simplify_database_error(str(e))
        return jsonify({"success": False, "message": error_message}), 500


@admin_blueprint.put("/installations/<int:installation_id>", endpoint="update_installation")
@require_role("admin")
def update_installation(installation_id: int):
    """Update an installation."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        capacidade = data.get("capacidade")
        eh_reservavel = data.get("eh_reservavel", "N")
    else:
        nome = request.form.get("nome", "").strip()
        capacidade = request.form.get("capacidade")
        eh_reservavel = request.form.get("eh_reservavel", "N")

    if not nome:
        return jsonify({"success": False, "message": "Nome da instalação é obrigatório"}), 400
    if capacidade is None:
        return jsonify({"success": False, "message": "Capacidade é obrigatória"}), 400
    if eh_reservavel not in ["S", "N"]:
        return jsonify({"success": False, "message": "eh_reservavel deve ser 'S' ou 'N'"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/atualizar_instalacao.sql",
            {
                "id": installation_id,
                "nome": nome,
                "capacidade": int(capacidade),
                "eh_reservavel": eh_reservavel,
            },
        )
        return jsonify({
            "success": True,
            "message": "Instalação atualizada com sucesso",
        })
    except Exception as e:
        error_message = simplify_database_error(str(e))
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Instalação não encontrada"}), 404
        return jsonify({"success": False, "message": error_message}), 500


@admin_blueprint.delete("/installations/<int:installation_id>", endpoint="delete_installation")
@require_role("admin")
def delete_installation(installation_id: int):
    """Delete an installation."""
    try:
        sql_queries.execute_statement(
            "queries/admin/deletar_instalacao.sql",
            {"id": installation_id},
        )
        return jsonify({
            "success": True,
            "message": "Instalação deletada com sucesso",
        })
    except Exception as e:
        error_message = simplify_database_error(str(e))
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Instalação não encontrada"}), 404
        return jsonify({"success": False, "message": error_message}), 500
