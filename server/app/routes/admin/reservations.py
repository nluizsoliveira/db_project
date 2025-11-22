from flask import jsonify

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@admin_blueprint.get("/reservations", endpoint="list_reservations")
@require_role("admin")
def list_reservations():
    """List all reservations."""
    try:
        reservations = sql_queries.fetch_all("queries/admin/listar_reservas.sql")
        return jsonify({
            "success": True,
            "reservations": reservations,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar reservas: {str(e)}"}), 500
