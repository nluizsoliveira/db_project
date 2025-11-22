from flask import jsonify, request

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@admin_blueprint.get("/events", endpoint="list_events")
@require_role("admin")
def list_events():
    """List all events."""
    try:
        events = sql_queries.fetch_all("queries/admin/listar_eventos.sql")
        return jsonify({
            "success": True,
            "events": events,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar eventos: {str(e)}"}), 500


@admin_blueprint.get("/events/<int:event_id>", endpoint="get_event")
@require_role("admin")
def get_event(event_id: int):
    """Get details of a specific event."""
    try:
        event = sql_queries.fetch_one(
            "queries/admin/buscar_evento.sql",
            {"id_evento": event_id},
        )
        if not event:
            return jsonify({"success": False, "message": "Evento não encontrado"}), 404
        return jsonify({
            "success": True,
            "event": event,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar evento: {str(e)}"}), 500


@admin_blueprint.post("/events", endpoint="create_event")
@require_role("admin")
def create_event():
    """Create a new event."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        descricao = data.get("descricao", "").strip()
        id_reserva = data.get("id_reserva")
    else:
        nome = request.form.get("nome", "").strip()
        descricao = request.form.get("descricao", "").strip()
        id_reserva = request.form.get("id_reserva")

    if not nome:
        return jsonify({"success": False, "message": "Nome do evento é obrigatório"}), 400
    if not id_reserva:
        return jsonify({"success": False, "message": "ID da reserva é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/criar_evento.sql",
            {
                "nome": nome,
                "descricao": descricao,
                "id_reserva": int(id_reserva),
            },
        )
        return jsonify({
            "success": True,
            "message": "Evento criado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Reserva não encontrada. Crie a reserva antes do evento."}), 400
        return jsonify({"success": False, "message": f"Erro ao criar evento: {error_message}"}), 500


@admin_blueprint.put("/events/<int:event_id>", endpoint="update_event")
@require_role("admin")
def update_event(event_id: int):
    """Update an event."""
    if request.is_json:
        data = request.json
        nome = data.get("nome", "").strip()
        descricao = data.get("descricao", "").strip()
    else:
        nome = request.form.get("nome", "").strip()
        descricao = request.form.get("descricao", "").strip()

    if not nome:
        return jsonify({"success": False, "message": "Nome do evento é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/admin/atualizar_evento.sql",
            {
                "id_evento": event_id,
                "nome": nome,
                "descricao": descricao,
            },
        )
        return jsonify({
            "success": True,
            "message": "Evento atualizado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Evento não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao atualizar evento: {error_message}"}), 500


@admin_blueprint.delete("/events/<int:event_id>", endpoint="delete_event")
@require_role("admin")
def delete_event(event_id: int):
    """Delete an event."""
    try:
        sql_queries.execute_statement(
            "queries/admin/deletar_evento.sql",
            {"id_evento": event_id},
        )
        return jsonify({
            "success": True,
            "message": "Evento deletado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Evento não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao deletar evento: {error_message}"}), 500
