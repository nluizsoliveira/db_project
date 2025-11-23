from flask import jsonify

from app.routes.views import views_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_auth


@views_blueprint.get("/reservas-completas", endpoint="reservas_completas")
@require_auth
def reservas_completas():
    """Retorna dados da view de reservas completas"""
    try:
        data = sql_queries.fetch_all("queries/views/reservas_completas.sql")
        return jsonify({
            "success": True,
            "data": data,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500


@views_blueprint.get("/atividades-completas", endpoint="atividades_completas")
@require_auth
def atividades_completas():
    """Retorna dados da view de atividades completas"""
    try:
        data = sql_queries.fetch_all("queries/views/atividades_completas.sql")
        return jsonify({
            "success": True,
            "data": data,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500


@views_blueprint.get("/equipamentos-disponiveis", endpoint="equipamentos_disponiveis")
@require_auth
def equipamentos_disponiveis():
    """Retorna dados da view de equipamentos disponíveis"""
    try:
        data = sql_queries.fetch_all("queries/views/equipamentos_disponiveis.sql")
        return jsonify({
            "success": True,
            "data": data,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500


@views_blueprint.get("/instalacoes-ocupacao", endpoint="instalacoes_ocupacao")
@require_auth
def instalacoes_ocupacao():
    """Retorna dados da view de instalações com ocupação"""
    try:
        data = sql_queries.fetch_all("queries/views/instalacoes_ocupacao.sql")
        return jsonify({
            "success": True,
            "data": data,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500
