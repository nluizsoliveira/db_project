from flask import jsonify, request

from app.routes.extension_group import extension_group_blueprint
from app.services.auth.decorators import require_role
from app.services.database import executor as sql_queries


@require_role("admin")
@extension_group_blueprint.route("/create", methods=["POST"])
def create_extension_group():
    if request.is_json:
        data = request.json
        name = data.get("group_name", "").strip()
        description = data.get("description", "").strip()
        cpf_responsible = data.get("cpf_responsible", "").strip()
    else:
        name = request.form.get("group_name", "").strip()
        description = request.form.get("description", "").strip()
        cpf_responsible = request.form.get("cpf_responsible", "").strip()

    if not name or not description or not cpf_responsible:
        return jsonify({
            "success": False,
            "message": "Grupo de extensão precisa de nome, descrição e responsável"
        }), 400

    try:
        sql_queries.execute_statement(
            "queries/extension_group/criar_grupo_extensao.sql",
            {
                "nome_grupo": name,
                "descricao": description,
                "cpf_responsavel": cpf_responsible,
            },
        )
        return jsonify({
            "success": True,
            "message": "Grupo de extensão criado com sucesso"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro ao criar grupo de extensão: {str(e)}"
        }), 400


@require_role("admin")
@extension_group_blueprint.route("/update", methods=["POST"])
def update_extension_group():
    if request.is_json:
        data = request.json
        old_name = data.get("old_group_name", "").strip()
        new_name = data.get("new_group_name", "").strip()
        description = data.get("description", "").strip()
        cpf_responsible = data.get("cpf_responsible", "").strip()
    else:
        old_name = request.form.get("old_group_name", "").strip()
        new_name = request.form.get("new_group_name", "").strip()
        description = request.form.get("description", "").strip()
        cpf_responsible = request.form.get("cpf_responsible", "").strip()

    if not old_name:
        return jsonify({
            "success": False,
            "message": "Nome do grupo antigo é obrigatório"
        }), 400

    group = sql_queries.fetch_one(
        "queries/extension_group/buscar_grupo.sql", {"nome_grupo": old_name}
    )

    if not group:
        return jsonify({
            "success": False,
            "message": "Grupo de extensão não encontrado"
        }), 404

    if not new_name:
        new_name = group["nome_grupo"]
    if not description:
        description = group["descricao"]
    if not cpf_responsible:
        cpf_responsible = group["cpf_responsavel_interno"]

    try:
        sql_queries.execute_statement(
            "queries/extension_group/atualizar_grupo_extensao.sql",
            {
                "nome_grupo_antigo": old_name,
                "nome_grupo_novo": new_name,
                "descricao": description,
                "cpf_responsavel": cpf_responsible,
            },
        )
        return jsonify({
            "success": True,
            "message": "Grupo de extensão atualizado com sucesso"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro ao atualizar grupo de extensão: {str(e)}"
        }), 400


@require_role("admin")
@extension_group_blueprint.route("/delete", methods=["DELETE"])
def delete_extension_group():
    if request.is_json:
        data = request.json
        name = data.get("group_name", "").strip()
    else:
        name = request.form.get("group_name", "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "É necessário passar o nome de um grupo"
        }), 400

    try:
        sql_queries.execute_statement(
            "queries/extension_group/deletar_grupo_extensao.sql",
            {
                "nome_grupo": name,
            },
        )
        return jsonify({
            "success": True,
            "message": "Grupo de extensão deletado com sucesso"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro ao deletar grupo de extensão: {str(e)}"
        }), 400
