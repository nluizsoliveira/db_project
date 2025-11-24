from flask import jsonify, request, current_app

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
        current_app.logger.info(f"[get_user] Buscando usuário com CPF: {cpf}")

        user = sql_queries.fetch_one(
            "queries/admin/buscar_usuario.sql",
            {"cpf": cpf},
        )

        current_app.logger.info(f"[get_user] Resultado da query: {user is not None}")

        if not user:
            current_app.logger.warning(f"[get_user] Usuário não encontrado: {cpf}")
            return jsonify({"success": False, "message": "Usuário não encontrado"}), 404

        current_app.logger.info(f"[get_user] Tipo do user: {type(user)}")
        current_app.logger.info(f"[get_user] Chaves do user: {list(user.keys()) if isinstance(user, dict) else 'N/A'}")

        # Garantir que valores booleanos sejam booleanos Python
        if "is_funcionario" in user:
            user["is_funcionario"] = bool(user.get("is_funcionario", False))
        else:
            user["is_funcionario"] = False

        if "is_educador_fisico" in user:
            user["is_educador_fisico"] = bool(user.get("is_educador_fisico", False))
        else:
            user["is_educador_fisico"] = False

        if "is_admin" in user:
            user["is_admin"] = bool(user.get("is_admin", False))
        else:
            user["is_admin"] = False

        # Garantir que atribuicoes seja uma lista válida
        if "atribuicoes" in user:
            atribuicoes = user.get("atribuicoes", [])
            current_app.logger.info(f"[get_user] Tipo de atribuicoes antes: {type(atribuicoes)}")
            current_app.logger.info(f"[get_user] Valor de atribuicoes antes: {atribuicoes}")

            if atribuicoes is None:
                user["atribuicoes"] = []
                current_app.logger.info("[get_user] Atribuicoes era None, convertido para []")
            elif not isinstance(atribuicoes, (list, tuple)):
                try:
                    user["atribuicoes"] = list(atribuicoes) if atribuicoes else []
                    current_app.logger.info(f"[get_user] Atribuicoes convertido de {type(atribuicoes)} para lista")
                except (TypeError, ValueError) as e:
                    current_app.logger.error(f"[get_user] Erro ao converter atribuicoes: {e}")
                    user["atribuicoes"] = []
            else:
                user["atribuicoes"] = list(atribuicoes)
                current_app.logger.info(f"[get_user] Atribuicoes já era lista/tupla, convertido para lista: {len(user['atribuicoes'])} itens")
        else:
            user["atribuicoes"] = []

        current_app.logger.info(f"[get_user] Retornando usuário com sucesso")
        return jsonify({
            "success": True,
            "user": user,
        })
    except Exception as e:
        import traceback
        current_app.logger.error(f"[get_user] Erro ao buscar usuário: {str(e)}")
        current_app.logger.error(f"[get_user] Traceback: {traceback.format_exc()}")
        traceback.print_exc()
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
            if numero_conselho:
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
            elif formacao:
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
    """Update a user with full permissions management."""
    def safe_strip(value, default=""):
        """Safely strip a value, handling None."""
        if value is None:
            return default
        return str(value).strip() if value else default

    if request.is_json:
        data = request.json
        novo_nome = safe_strip(data.get("nome"))
        novo_email = safe_strip(data.get("email"))
        novo_celular = safe_strip(data.get("celular"))
        nova_formacao = safe_strip(data.get("formacao"))
        novo_conselho = safe_strip(data.get("numero_conselho"))
        tipo_usuario = safe_strip(data.get("tipo_usuario"))
        nusp = safe_strip(data.get("nusp"))
        is_admin = data.get("is_admin", False)
        is_funcionario = data.get("is_funcionario", False)
        is_educador_fisico = data.get("is_educador_fisico", False)
        atribuicao = safe_strip(data.get("atribuicao"))
    else:
        novo_nome = safe_strip(request.form.get("nome"))
        novo_email = safe_strip(request.form.get("email"))
        novo_celular = safe_strip(request.form.get("celular"))
        nova_formacao = safe_strip(request.form.get("formacao"))
        novo_conselho = safe_strip(request.form.get("numero_conselho"))
        tipo_usuario = safe_strip(request.form.get("tipo_usuario"))
        nusp = safe_strip(request.form.get("nusp"))
        is_admin = request.form.get("is_admin", "false").lower() == "true"
        is_funcionario = request.form.get("is_funcionario", "false").lower() == "true"
        is_educador_fisico = request.form.get("is_educador_fisico", "false").lower() == "true"
        atribuicao = safe_strip(request.form.get("atribuicao"))

    if not novo_nome or not novo_email:
        return jsonify({"success": False, "message": "Nome e email são obrigatórios"}), 400

    try:
        # Buscar estado atual do usuário
        current_user = sql_queries.fetch_one(
            "queries/admin/buscar_usuario.sql",
            {"cpf": cpf},
        )
        if not current_user:
            return jsonify({"success": False, "message": "Usuário não encontrado"}), 404

        current_is_interno = current_user.get("tipo_usuario") == "interno"
        current_is_funcionario = current_user.get("is_funcionario", False)
        current_is_educador_fisico = current_user.get("is_educador_fisico", False)
        current_is_admin = current_user.get("is_admin", False)
        current_atribuicoes = current_user.get("atribuicoes", [])

        # Garantir que atribuicoes seja uma lista
        if current_atribuicoes is None:
            current_atribuicoes = []
        elif isinstance(current_atribuicoes, str):
            # Se for string, tentar parsear como array
            import json
            try:
                current_atribuicoes = json.loads(current_atribuicoes)
            except:
                current_atribuicoes = []
        elif not isinstance(current_atribuicoes, (list, tuple)):
            # Se não for lista ou tupla, converter
            try:
                current_atribuicoes = list(current_atribuicoes) if current_atribuicoes else []
            except:
                current_atribuicoes = []

        # Atualizar dados básicos da pessoa
        sql_queries.execute_statement(
            "queries/admin/atualizar_pessoa.sql",
            {
                "cpf": cpf,
                "nome": novo_nome,
                "email": novo_email,
                "celular": novo_celular if novo_celular else None,
            },
        )

        # Gerenciar tipo de usuário (interno/externo)
        is_interno = tipo_usuario == "interno"
        if is_interno and not current_is_interno:
            # Adicionar como interno
            if not nusp:
                return jsonify({"success": False, "message": "NUSP é obrigatório para usuário interno"}), 400

            sql_queries.execute_statement(
                "queries/admin/adicionar_interno.sql",
                {
                    "cpf": cpf,
                    "nusp": nusp,
                },
            )
        elif not is_interno and current_is_interno:
            # Remover como interno (cascade remove funcionario, educador, atribuicoes)
            sql_queries.execute_statement(
                "queries/admin/remover_interno.sql",
                {"cpf": cpf},
            )
            # Reset flags já que foi removido
            current_is_funcionario = False
            current_is_educador_fisico = False
            current_is_admin = False
            current_atribuicoes = []
        elif is_interno and current_is_interno:
            # Atualizar nusp se for interno
            if nusp:
                sql_queries.execute_statement(
                    "queries/admin/atualizar_nusp.sql",
                    {
                        "cpf": cpf,
                        "nusp": nusp,
                    },
                )

        # Gerenciar funcionário (staff)
        if is_funcionario and not current_is_funcionario:
            # Adicionar como funcionário
            if not is_interno:
                return jsonify({"success": False, "message": "Usuário deve ser interno para ser funcionário"}), 400
            if not nova_formacao:
                return jsonify({"success": False, "message": "Formação é obrigatória para funcionário"}), 400
            sql_queries.execute_statement(
                "queries/admin/adicionar_funcionario.sql",
                {
                    "cpf": cpf,
                    "formacao": nova_formacao,
                },
            )
        elif not is_funcionario and current_is_funcionario:
            # Remover como funcionário (cascade remove atribuicoes e educador)
            sql_queries.execute_statement(
                "queries/admin/remover_funcionario.sql",
                {"cpf": cpf},
            )
            current_is_educador_fisico = False
            current_is_admin = False
            current_atribuicoes = []
        elif is_funcionario and current_is_funcionario:
            # Atualizar formação se for funcionário
            if nova_formacao:
                sql_queries.execute_statement(
                    "queries/admin/atualizar_funcionario.sql",
                    {
                        "cpf": cpf,
                        "formacao": nova_formacao,
                    },
                )

        # Gerenciar educador físico
        if is_educador_fisico and not current_is_educador_fisico:
            # Adicionar como educador físico
            if not is_funcionario:
                return jsonify({"success": False, "message": "Usuário deve ser funcionário para ser educador físico"}), 400
            if not novo_conselho:
                return jsonify({"success": False, "message": "Número do conselho é obrigatório para educador físico"}), 400
            sql_queries.execute_statement(
                "queries/admin/adicionar_educador.sql",
                {
                    "cpf": cpf,
                    "numero_conselho": novo_conselho,
                },
            )
        elif not is_educador_fisico and current_is_educador_fisico:
            # Remover como educador físico
            sql_queries.execute_statement(
                "queries/admin/remover_educador.sql",
                {"cpf": cpf},
            )
        elif is_educador_fisico and current_is_educador_fisico:
            # Atualizar conselho se for educador
            if novo_conselho:
                sql_queries.execute_statement(
                    "queries/admin/atualizar_educador.sql",
                    {
                        "cpf": cpf,
                        "conselho": novo_conselho,
                    },
                )

        # Gerenciar atribuições (incluindo admin)
        if is_funcionario:
            # Remover todas as atribuições atuais
            sql_queries.execute_statement(
                "queries/admin/remover_todas_atribuicoes.sql",
                {"cpf": cpf},
            )

            # Adicionar atribuição principal se especificada
            if atribuicao:
                sql_queries.execute_statement(
                    "queries/admin/adicionar_atribuicao.sql",
                    {
                        "cpf": cpf,
                        "atribuicao": atribuicao,
                    },
                )

            # Adicionar atribuição de Administrador se is_admin
            if is_admin:
                sql_queries.execute_statement(
                    "queries/admin/adicionar_atribuicao.sql",
                    {
                        "cpf": cpf,
                        "atribuicao": "Administrador",
                    },
                )
        elif not is_funcionario and current_atribuicoes:
            # Se não é mais funcionário, remover todas atribuições
            sql_queries.execute_statement(
                "queries/admin/remover_todas_atribuicoes.sql",
                {"cpf": cpf},
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
