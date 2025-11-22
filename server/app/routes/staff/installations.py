from flask import jsonify, request

from app.routes.staff import staff_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@staff_blueprint.get("/installations/reservations", endpoint="list_installation_reservations")
@require_role("staff", "admin")
def list_installation_reservations():
    """List all installation reservations with optional filters."""
    filters = {
        "data_inicio": request.args.get("data_inicio") or None,
        "data_fim": request.args.get("data_fim") or None,
        "id_instalacao": request.args.get("id_instalacao") or None,
        "cpf_responsavel": request.args.get("cpf_responsavel") or None,
    }

    try:
        reservations = sql_queries.fetch_all(
            "queries/staff/listar_reservas_instalacoes.sql",
            filters,
        )
        return jsonify({
            "success": True,
            "reservations": reservations,
            "filters": filters,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar reservas: {str(e)}"}), 500


@staff_blueprint.delete("/installations/reservations/<int:reservation_id>", endpoint="cancel_installation_reservation")
@require_role("staff", "admin")
def cancel_installation_reservation(reservation_id: int):
    """Cancel an installation reservation."""
    try:
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
