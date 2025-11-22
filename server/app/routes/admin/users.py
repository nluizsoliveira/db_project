from flask import jsonify, request

from app.routes.admin import admin_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@admin_blueprint.get("/users", endpoint="list_users")
@require_role("admin")
def list_users():
    """List all users."""
    try:
        users = sql_queries.fetch_all("queries/admin/listar_usuarios.sql")
        return jsonify({
            "success": True,
            "users": users,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao listar usuários: {str(e)}"}), 500


@admin_blueprint.get("/users/<cpf>", endpoint="get_user")
@require_role("admin")
def get_user(cpf: str):
    """Get details of a specific user."""
    try:
        user = sql_queries.fetch_one(
            "queries/admin/buscar_usuario.sql",
            {"cpf": cpf},
        )
        if not user:
            return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
        return jsonify({
            "success": True,
            "user": user,
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar usuário: {str(e)}"}), 500


@admin_blueprint.post("/users", endpoint="create_user")
@require_role("admin")
def create_user():
    """Create a new user."""
    if request.is_json:
        data = request.json
        cpf = data.get("cpf", "").strip()
        nome = data.get("nome", "").strip()
        email = data.get("email", "").strip()
        celular = data.get("celular", "").strip()
        data_nascimento = data.get("data_nascimento")
        tipo_usuario = data.get("tipo_usuario", "").strip()
        nusp = data.get("nusp", "").strip()
        categoria = data.get("categoria", "").strip()
        formacao = data.get("formacao", "").strip()
        numero_conselho = data.get("numero_conselho", "").strip()
    else:
        cpf = request.form.get("cpf", "").strip()
        nome = request.form.get("nome", "").strip()
        email = request.form.get("email", "").strip()
        celular = request.form.get("celular", "").strip()
        data_nascimento = request.form.get("data_nascimento")
        tipo_usuario = request.form.get("tipo_usuario", "").strip()
        nusp = request.form.get("nusp", "").strip()
        categoria = request.form.get("categoria", "").strip()
        formacao = request.form.get("formacao", "").strip()
        numero_conselho = request.form.get("numero_conselho", "").strip()

    if not cpf or not nome or not email:
        return jsonify({"success": False, "message": "CPF, nome e email são obrigatórios"}), 400

    try:
        # Criar tipo específico de usuário
        if tipo_usuario == "interno":
            if not nusp:
                return jsonify({"success": False, "message": "NUSP é obrigatório para interno"}), 400

            # Se for educador físico
            if categoria == "FUNCIONARIO" and numero_conselho:
                if not formacao:
                    return jsonify({"success": False, "message": "Formação é obrigatória para educador físico"}), 400
                sql_queries.execute_statement(
                    "queries/admin/criar_educador_fisico.sql",
                    {
                        "cpf": cpf,
                        "nome": nome,
                        "email": email,
                        "celular": celular if celular else None,
                        "data_nascimento": data_nascimento if data_nascimento else None,
                        "nusp": nusp,
                        "formacao": formacao,
                        "numero_conselho": numero_conselho,
                    },
                )
            # Se for funcionário
            elif categoria == "FUNCIONARIO":
                if not formacao:
                    return jsonify({"success": False, "message": "Formação é obrigatória para funcionário"}), 400
                sql_queries.execute_statement(
                    "queries/admin/criar_funcionario.sql",
                    {
                        "cpf": cpf,
                        "nome": nome,
                        "email": email,
                        "celular": celular if celular else None,
                        "data_nascimento": data_nascimento if data_nascimento else None,
                        "nusp": nusp,
                        "formacao": formacao,
                    },
                )
            # Se for apenas interno
            else:
                sql_queries.execute_statement(
                    "queries/admin/criar_interno.sql",
                    {
                        "cpf": cpf,
                        "nome": nome,
                        "email": email,
                        "celular": celular if celular else None,
                        "data_nascimento": data_nascimento if data_nascimento else None,
                        "nusp": nusp,
                        "categoria": categoria if categoria else "ALUNO",
                    },
                )
        else:
            # Criar apenas pessoa (externo ou pessoa comum)
            sql_queries.execute_statement(
                "queries/admin/criar_pessoa.sql",
                {
                    "cpf": cpf,
                    "nome": nome,
                    "email": email,
                    "celular": celular if celular else None,
                    "data_nascimento": data_nascimento if data_nascimento else None,
                },
            )

        return jsonify({
            "success": True,
            "message": "Usuário criado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        return jsonify({"success": False, "message": f"Erro ao criar usuário: {error_message}"}), 500


@admin_blueprint.put("/users/<cpf>", endpoint="update_user")
@require_role("admin")
def update_user(cpf: str):
    """Update a user."""
    if request.is_json:
        data = request.json
        novo_nome = data.get("nome", "").strip()
        novo_email = data.get("email", "").strip()
        novo_celular = data.get("celular", "").strip()
        nova_categoria = data.get("categoria", "").strip()
        nova_formacao = data.get("formacao", "").strip()
        novo_conselho = data.get("numero_conselho", "").strip()
    else:
        novo_nome = request.form.get("nome", "").strip()
        novo_email = request.form.get("email", "").strip()
        novo_celular = request.form.get("celular", "").strip()
        nova_categoria = request.form.get("categoria", "").strip()
        nova_formacao = request.form.get("formacao", "").strip()
        novo_conselho = request.form.get("numero_conselho", "").strip()

    if not novo_nome or not novo_email:
        return jsonify({"success": False, "message": "Nome e email são obrigatórios"}), 400

    try:
        # Atualizar pessoa
        sql_queries.execute_statement(
            "queries/admin/atualizar_pessoa.sql",
            {
                "cpf": cpf,
                "nome": novo_nome,
                "email": novo_email,
                "celular": novo_celular if novo_celular else None,
            },
        )

        # Atualizar categoria se for interno
        if nova_categoria:
            sql_queries.execute_statement(
                "queries/admin/atualizar_interno.sql",
                {
                    "cpf": cpf,
                    "categoria": nova_categoria,
                },
            )

        # Atualizar formacao se for funcionário
        if nova_formacao:
            sql_queries.execute_statement(
                "queries/admin/atualizar_funcionario.sql",
                {
                    "cpf": cpf,
                    "formacao": nova_formacao,
                },
            )

        # Atualizar conselho se for educador
        if novo_conselho:
            sql_queries.execute_statement(
                "queries/admin/atualizar_educador.sql",
                {
                    "cpf": cpf,
                    "conselho": novo_conselho,
                },
            )

        return jsonify({
            "success": True,
            "message": "Usuário atualizado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower() or "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao atualizar usuário: {error_message}"}), 500


@admin_blueprint.delete("/users/<cpf>", endpoint="delete_user")
@require_role("admin")
def delete_user(cpf: str):
    """Delete a user."""
    try:
        sql_queries.execute_statement(
            "queries/admin/deletar_pessoa.sql",
            {"cpf": cpf},
        )
        return jsonify({
            "success": True,
            "message": "Usuário deletado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrado" in error_message.lower() or "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao deletar usuário: {error_message}"}), 500
