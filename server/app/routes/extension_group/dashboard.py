from flask import jsonify
from app.routes.extension_group import extension_group_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@extension_group_blueprint.get("/", endpoint="list")
@require_role("admin")
def list_extension_groups():
    groups = sql_queries.fetch_all("queries/extension_group/listar_grupos_extensao.sql")

    return jsonify({
        "success": True,
        "groups": groups,
    })
