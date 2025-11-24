import secrets
from flask import current_app, jsonify, request, session, g
from psycopg2.extras import RealDictCursor

from app.routes.internal import internal_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_role


@internal_blueprint.get("/", endpoint="dashboard")
@require_role("internal", "staff", "admin")
def dashboard():
    cpf = request.args.get("cpf") or ""
    reservas_instalacoes = []
    reservas_equipamentos = []
    if cpf:
        reservas_instalacoes = sql_queries.fetch_all(
            "queries/internal/reservas_por_interno.sql",
            {"cpf": cpf},
        )
        reservas_equipamentos = sql_queries.fetch_all(
            "queries/internal/reservas_equipamentos_por_interno.sql",
            {"cpf": cpf},
        )

    date_param = request.args.get("date") or None
    start_param = request.args.get("start") or None
    end_param = request.args.get("end") or None

    available_installs: list[dict[str, str]] = []
    available_equipment: list[dict[str, str]] = []
    if date_param and start_param and end_param:
        available_installs = sql_queries.fetch_all(
            "queries/internal/instalacoes_disponiveis.sql",
            {
                "date": date_param,
                "start": start_param,
                "end": end_param,
            },
        )
        available_equipment = sql_queries.fetch_all(
            "queries/internal/equipamentos_disponiveis.sql",
            {
                "date": date_param,
                "start": start_param,
                "end": end_param,
            },
        )

    return jsonify({
        "success": True,
        "cpf": cpf,
        "reservas": reservas_instalacoes,
        "reservas_equipamentos": reservas_equipamentos,
        "date_filter": date_param,
        "start_filter": start_param,
        "end_filter": end_param,
        "available_installs": available_installs,
        "available_equipment": available_equipment,
    })


@internal_blueprint.get("/activities", endpoint="activities")
@require_role("internal", "staff", "admin")
def list_activities():
    """List available activities with optional filters."""
    weekday = request.args.get("weekday") or None
    group_name = request.args.get("group_name") or None
    modality = request.args.get("modality") or None
    cpf_participante = session.get("user_id") or None

    activities = sql_queries.fetch_all(
        "queries/internal/atividades_disponiveis.sql",
        {
            "weekday": weekday,
            "group_name": group_name,
            "modality": modality,
            "cpf_participante": cpf_participante,
        },
    )

    return jsonify({
        "success": True,
        "activities": activities,
    })


@internal_blueprint.post("/activities/enroll", endpoint="enroll_activity")
@require_role("internal", "staff", "admin")
def enroll_activity():
    """Enroll in an activity."""
    cpf_participante = session.get("user_id")
    if not cpf_participante:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_atividade = data.get("id_atividade")
    else:
        id_atividade = request.form.get("id_atividade")

    if not id_atividade:
        return jsonify({"success": False, "message": "ID da atividade é obrigatório"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/inscrever_em_atividade.sql",
            {
                "cpf_participante": cpf_participante,
                "id_atividade": int(id_atividade),
            },
        )
        return jsonify({
            "success": True,
            "message": "Inscrição realizada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "já está inscrito" in error_message.lower():
            return jsonify({"success": False, "message": "Você já está inscrito nesta atividade"}), 400
        if "vagas esgotadas" in error_message.lower():
            return jsonify({"success": False, "message": "As vagas para esta atividade estão esgotadas"}), 400
        return jsonify({"success": False, "message": f"Erro ao inscrever: {error_message}"}), 500


@internal_blueprint.post("/reservations/installation", endpoint="reserve_installation")
@require_role("internal", "staff", "admin")
def reserve_installation():
    """Reserve an installation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_instalacao = data.get("id_instalacao")
        data_reserva = data.get("data")
        hora_inicio = data.get("hora_inicio")
        hora_fim = data.get("hora_fim")
    else:
        id_instalacao = request.form.get("id_instalacao")
        data_reserva = request.form.get("data")
        hora_inicio = request.form.get("hora_inicio")
        hora_fim = request.form.get("hora_fim")

    if not all([id_instalacao, data_reserva, hora_inicio, hora_fim]):
        return jsonify({"success": False, "message": "Todos os campos são obrigatórios"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/reservar_instalacao.sql",
            {
                "id_instalacao": int(id_instalacao),
                "cpf_responsavel": cpf_responsavel,
                "data": data_reserva,
                "hora_inicio": hora_inicio,
                "hora_fim": hora_fim,
            },
        )
        return jsonify({
            "success": True,
            "message": "Reserva realizada com sucesso",
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao reservar instalação: {str(e)}"}), 500


@internal_blueprint.post("/reservations/equipment", endpoint="reserve_equipment")
@require_role("internal", "staff", "admin")
def reserve_equipment():
    """Reserve equipment."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    if request.is_json:
        data = request.json
        id_equipamento = data.get("id_equipamento")
        data_reserva = data.get("data")
        hora_inicio = data.get("hora_inicio")
        hora_fim = data.get("hora_fim")
    else:
        id_equipamento = request.form.get("id_equipamento")
        data_reserva = request.form.get("data")
        hora_inicio = request.form.get("hora_inicio")
        hora_fim = request.form.get("hora_fim")

    if not all([id_equipamento, data_reserva, hora_inicio, hora_fim]):
        return jsonify({"success": False, "message": "Todos os campos são obrigatórios"}), 400

    try:
        sql_queries.execute_statement(
            "queries/internal/reservar_equipamento.sql",
            {
                "id_equipamento": id_equipamento,
                "cpf_responsavel": cpf_responsavel,
                "data": data_reserva,
                "hora_inicio": hora_inicio,
                "hora_fim": hora_fim,
            },
        )
        return jsonify({
            "success": True,
            "message": "Reserva de equipamento realizada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não é reservável" in error_message.lower():
            return jsonify({"success": False, "message": "Este equipamento não é reservável"}), 400
        if "horário de fim deve ser maior" in error_message.lower() or "ck_reserva_equip_horario" in error_message.lower():
            return jsonify({"success": False, "message": "O horário de fim deve ser maior que o horário de início"}), 400
        return jsonify({"success": False, "message": f"Erro ao reservar equipamento: {error_message}"}), 500


@internal_blueprint.get("/equipment", endpoint="list_equipment")
@require_role("internal", "staff", "admin")
def list_equipment():
    """List available equipment for reservation."""
    equipment = sql_queries.fetch_all(
        "queries/internal/listar_equipamentos_disponiveis.sql",
    )

    return jsonify({
        "success": True,
        "equipment": equipment,
    })


@internal_blueprint.get("/invites", endpoint="list_invites")
@require_role("internal", "staff", "admin")
def list_invites():
    """List invites created by the current internal user."""
    current_app.logger.info("=" * 80)
    current_app.logger.info("DEBUG LIST_INVITES - INÍCIO")
    current_app.logger.info("=" * 80)

    # Debug session
    current_app.logger.info(f"DEBUG LIST_INVITES - Session completa: {dict(session)}")
    cpf_convidante = session.get("user_id")
    current_app.logger.info(f"DEBUG LIST_INVITES - CPF do convidante obtido da sessão: {cpf_convidante}")
    current_app.logger.info(f"DEBUG LIST_INVITES - Tipo do CPF: {type(cpf_convidante)}")

    if not cpf_convidante:
        current_app.logger.error("DEBUG LIST_INVITES - Usuário não autenticado - CPF não encontrado na sessão")
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    # Debug: verificar quantos convites existem no total para este CPF ANTES da query
    try:
        from flask import g
        if hasattr(g, 'db_session') and g.db_session:
            with g.db_session.connection.cursor() as cursor:
                # Contar total
                cursor.execute(
                    "SELECT COUNT(*) as total FROM CONVITE_EXTERNO WHERE CPF_CONVIDANTE = %s",
                    (cpf_convidante,)
                )
                count_result = cursor.fetchone()
                total_count = count_result[0] if count_result else 0
                current_app.logger.info(f"DEBUG LIST_INVITES - Total de convites no banco para CPF '{cpf_convidante}': {total_count}")

                # Listar todos os CPFs de convidantes únicos
                cursor.execute(
                    "SELECT DISTINCT CPF_CONVIDANTE, COUNT(*) as count FROM CONVITE_EXTERNO GROUP BY CPF_CONVIDANTE ORDER BY count DESC LIMIT 10"
                )
                all_cpfs = cursor.fetchall()
                current_app.logger.info(f"DEBUG LIST_INVITES - CPFs de convidantes no banco (top 10): {all_cpfs}")

                # Verificar se o CPF existe na tabela INTERNO_USP
                cursor.execute(
                    "SELECT CPF_PESSOA FROM INTERNO_USP WHERE CPF_PESSOA = %s",
                    (cpf_convidante,)
                )
                cpf_exists = cursor.fetchone()
                current_app.logger.info(f"DEBUG LIST_INVITES - CPF existe em INTERNO_USP: {cpf_exists is not None}")
    except Exception as e:
        current_app.logger.warning(f"DEBUG LIST_INVITES - Erro ao fazer debug queries: {str(e)}")

    current_app.logger.info(f"DEBUG LIST_INVITES - Executando query convites_por_interno.sql com CPF: '{cpf_convidante}'")

    invites = sql_queries.fetch_all(
        "queries/internal/convites_por_interno.sql",
        {"cpf_convidante": cpf_convidante},
    )

    current_app.logger.info(f"DEBUG LIST_INVITES - Query retornou {len(invites)} convites")

    if invites:
        current_app.logger.info(f"DEBUG LIST_INVITES - Detalhes dos convites encontrados:")
        for idx, invite in enumerate(invites):
            current_app.logger.info(f"  Convite {idx+1}:")
            current_app.logger.info(f"    - ID: {invite.get('id_convite')}")
            current_app.logger.info(f"    - Nome: {invite.get('nome_convidado')}")
            current_app.logger.info(f"    - Documento: {invite.get('documento_convidado')}")
            current_app.logger.info(f"    - CPF Convidante no banco: {invite.get('cpf_convidante', 'N/A')}")
            current_app.logger.info(f"    - Status: {invite.get('status')}")
            current_app.logger.info(f"    - Token: {invite.get('token', 'N/A')[:20] if invite.get('token') else 'N/A'}...")
            current_app.logger.info(f"    - Data: {invite.get('data_convite')}")
    else:
        current_app.logger.warning(f"DEBUG LIST_INVITES - Nenhum convite encontrado para CPF '{cpf_convidante}'")
        current_app.logger.warning(f"  - Verifique se o CPF está correto")
        current_app.logger.warning(f"  - Verifique se há convites no banco para este CPF")

    current_app.logger.info("=" * 80)
    current_app.logger.info("DEBUG LIST_INVITES - FIM")
    current_app.logger.info("=" * 80)

    return jsonify({
        "success": True,
        "invites": invites,
    })


@internal_blueprint.post("/invites", endpoint="create_invite")
@require_role("internal", "staff", "admin")
def create_invite():
    """Create a new external invite."""
    current_app.logger.info("=" * 80)
    current_app.logger.info("DEBUG CREATE_INVITE - INÍCIO")
    current_app.logger.info("=" * 80)

    # Debug session
    current_app.logger.info(f"DEBUG CREATE_INVITE - Session completa: {dict(session)}")
    cpf_convidante = session.get("user_id")
    current_app.logger.info(f"DEBUG CREATE_INVITE - CPF do convidante obtido da sessão: {cpf_convidante}")
    current_app.logger.info(f"DEBUG CREATE_INVITE - Tipo do CPF: {type(cpf_convidante)}")

    if not cpf_convidante:
        current_app.logger.error("DEBUG CREATE_INVITE - Usuário não autenticado - CPF não encontrado na sessão")
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    # Debug request data
    current_app.logger.info(f"DEBUG CREATE_INVITE - Request is_json: {request.is_json}")
    current_app.logger.info(f"DEBUG CREATE_INVITE - Request method: {request.method}")
    current_app.logger.info(f"DEBUG CREATE_INVITE - Request content_type: {request.content_type}")

    if request.is_json:
        data = request.json
        current_app.logger.info(f"DEBUG CREATE_INVITE - Dados recebidos (JSON): {data}")
        documento_convidado = data.get("documento_convidado", "").strip()
        nome_convidado = data.get("nome_convidado", "").strip()
        email_convidado = data.get("email_convidado", "").strip() or None
        telefone_convidado = data.get("telefone_convidado", "").strip() or None
        id_atividade = data.get("id_atividade") or None
        observacoes = data.get("observacoes", "").strip() or None
    else:
        current_app.logger.info(f"DEBUG CREATE_INVITE - Dados recebidos (FORM): {dict(request.form)}")
        documento_convidado = request.form.get("documento_convidado", "").strip()
        nome_convidado = request.form.get("nome_convidado", "").strip()
        email_convidado = request.form.get("email_convidado", "").strip() or None
        telefone_convidado = request.form.get("telefone_convidado", "").strip() or None
        id_atividade = request.form.get("id_atividade") or None
        observacoes = request.form.get("observacoes", "").strip() or None

    current_app.logger.info(f"DEBUG CREATE_INVITE - Dados processados:")
    current_app.logger.info(f"  - documento_convidado: '{documento_convidado}' (len: {len(documento_convidado)})")
    current_app.logger.info(f"  - nome_convidado: '{nome_convidado}' (len: {len(nome_convidado)})")
    current_app.logger.info(f"  - email_convidado: {email_convidado}")
    current_app.logger.info(f"  - telefone_convidado: {telefone_convidado}")
    current_app.logger.info(f"  - id_atividade: {id_atividade} (tipo: {type(id_atividade)})")
    current_app.logger.info(f"  - observacoes: {observacoes}")

    if not documento_convidado or not nome_convidado:
        current_app.logger.warning(f"DEBUG CREATE_INVITE - Validação falhou: documento ou nome vazio")
        return jsonify({"success": False, "message": "Documento e nome do convidado são obrigatórios"}), 400

    # Generate unique token (ensure no whitespace)
    token = secrets.token_hex(32).strip()
    current_app.logger.info(f"DEBUG CREATE_INVITE - Token gerado: '{token}' (tamanho: {len(token)})")
    current_app.logger.info(f"DEBUG CREATE_INVITE - Token (primeiros 20 chars): '{token[:20]}...'")

    # Debug: verificar se já existe token igual
    try:
        from flask import g
        if hasattr(g, 'db_session') and g.db_session:
            with g.db_session.connection.cursor() as cursor:
                cursor.execute(
                    "SELECT COUNT(*) as count FROM CONVITE_EXTERNO WHERE TOKEN = %s",
                    (token,)
                )
                existing = cursor.fetchone()
                if existing and existing[0] > 0:
                    current_app.logger.warning(f"DEBUG CREATE_INVITE - Token duplicado encontrado! Count: {existing[0]}")
                else:
                    current_app.logger.info(f"DEBUG CREATE_INVITE - Token único confirmado")
    except Exception as e:
        current_app.logger.warning(f"DEBUG CREATE_INVITE - Erro ao verificar token único: {str(e)}")

    # Preparar parâmetros para query
    query_params = {
        "cpf_convidante": cpf_convidante,
        "documento_convidado": documento_convidado,
        "nome_convidado": nome_convidado,
        "email_convidado": email_convidado,
        "telefone_convidado": telefone_convidado,
        "id_atividade": int(id_atividade) if id_atividade else None,  # Não pode ser None se frontend está obrigando, mas deixamos para validação
        "token": token,
        "observacoes": observacoes,
    }
    current_app.logger.info(f"DEBUG CREATE_INVITE - Parâmetros da query: {query_params}")

    try:
        current_app.logger.info(f"DEBUG CREATE_INVITE - Executando query criar_convite_externo.sql")
        # Usar conexão direta para garantir que podemos fazer commit imediatamente
        if not hasattr(g, 'db_session') or not g.db_session:
            current_app.logger.error("DEBUG CREATE_INVITE - db_session não disponível")
            return jsonify({"success": False, "message": "Erro de conexão com banco de dados"}), 500

        # Carregar query SQL
        from pathlib import Path
        sql_root = Path(__file__).resolve().parents[3] / "sql"
        query_path = sql_root / "queries/internal/criar_convite_externo.sql"
        query = query_path.read_text(encoding="utf-8")

        # Executar INSERT e fazer commit imediatamente
        with g.db_session.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            current_app.logger.info(f"DEBUG CREATE_INVITE - Executando INSERT...")
            cursor.execute(query, query_params)
            result_row = cursor.fetchone()
            current_app.logger.info(f"DEBUG CREATE_INVITE - Resultado do cursor: {result_row}")

            # Fazer commit IMEDIATAMENTE após o INSERT, antes de qualquer outra operação
            current_app.logger.info(f"DEBUG CREATE_INVITE - Fazendo commit imediato após INSERT...")
            g.db_session.connection.commit()
            current_app.logger.info(f"DEBUG CREATE_INVITE - Commit realizado com sucesso!")

            if result_row:
                # Converter para dict e tornar JSON serializable
                from datetime import date, datetime, time
                def make_json_serializable(obj):
                    if isinstance(obj, (time, date, datetime)):
                        return obj.isoformat()
                    if isinstance(obj, dict):
                        return {k: make_json_serializable(v) for k, v in obj.items()}
                    if isinstance(obj, list):
                        return [make_json_serializable(item) for item in obj]
                    return obj

                result = make_json_serializable(dict(result_row))
                current_app.logger.info(f"DEBUG CREATE_INVITE - Resultado processado: {result}")
            else:
                result = None
                current_app.logger.error(f"DEBUG CREATE_INVITE - Nenhum resultado retornado do INSERT")

        if result:
            invite_id = result.get('id_convite')
            invite_status = result.get('status')
            current_app.logger.info(f"DEBUG CREATE_INVITE - Convite criado com sucesso!")
            current_app.logger.info(f"  - ID: {invite_id}")
            current_app.logger.info(f"  - Status: {invite_status}")
            current_app.logger.info(f"  - CPF Convidante: {cpf_convidante}")
            current_app.logger.info(f"  - Token: {token[:20]}...")

            # Verificar se o convite foi realmente salvo no banco (após commit já feito)
            current_app.logger.info(f"DEBUG CREATE_INVITE - Verificando se convite foi persistido no banco...")
            try:
                if hasattr(g, 'db_session') and g.db_session:
                    with g.db_session.connection.cursor() as verify_cursor:
                        # Verificar por TOKEN (mais importante)
                        verify_cursor.execute(
                            "SELECT ID_CONVITE, STATUS, CPF_CONVIDANTE, TOKEN, NOME_CONVIDADO FROM CONVITE_EXTERNO WHERE TOKEN = %s",
                            (token,)
                        )
                        verify_by_token = verify_cursor.fetchone()
                        if verify_by_token:
                            current_app.logger.info(f"DEBUG CREATE_INVITE - ✓ Verificação por TOKEN: ENCONTRADO")
                            current_app.logger.info(f"  - ID no banco: {verify_by_token[0]}")
                            current_app.logger.info(f"  - Status no banco: {verify_by_token[1]}")
                            current_app.logger.info(f"  - CPF no banco: {verify_by_token[2]}")
                            current_app.logger.info(f"  - Token no banco: {verify_by_token[3]}")
                            current_app.logger.info(f"  - Nome no banco: {verify_by_token[4]}")
                        else:
                            current_app.logger.error(f"DEBUG CREATE_INVITE - ✗ ERRO: Convite NÃO encontrado por TOKEN!")
                            current_app.logger.error(f"  - Token procurado: '{token}'")

                        # Verificar por ID também
                        verify_cursor.execute(
                            "SELECT ID_CONVITE, STATUS, CPF_CONVIDANTE, TOKEN, NOME_CONVIDADO FROM CONVITE_EXTERNO WHERE ID_CONVITE = %s",
                            (invite_id,)
                        )
                        verify_by_id = verify_cursor.fetchone()
                        if verify_by_id:
                            current_app.logger.info(f"DEBUG CREATE_INVITE - ✓ Verificação por ID: ENCONTRADO")
                        else:
                            current_app.logger.error(f"DEBUG CREATE_INVITE - ✗ ERRO: Convite NÃO encontrado por ID!")
                            current_app.logger.error(f"  - ID procurado: {invite_id}")
            except Exception as e:
                current_app.logger.warning(f"DEBUG CREATE_INVITE - Erro ao verificar no banco: {str(e)}", exc_info=True)

            current_app.logger.info("=" * 80)
            current_app.logger.info("DEBUG CREATE_INVITE - FIM (SUCESSO)")
            current_app.logger.info("=" * 80)

            return jsonify({
                "success": True,
                "message": "Convite criado com sucesso",
                "invite": {
                    "id_convite": invite_id,
                    "token": token,
                    "status": invite_status,
                },
            })
        else:
            current_app.logger.error(f"DEBUG CREATE_INVITE - ERRO: Query retornou None ou vazio")
            current_app.logger.error(f"  - CPF: {cpf_convidante}")
            current_app.logger.error(f"  - Token: {token[:20]}...")
            current_app.logger.info("=" * 80)
            current_app.logger.info("DEBUG CREATE_INVITE - FIM (ERRO)")
            current_app.logger.info("=" * 80)
            return jsonify({"success": False, "message": "Erro ao criar convite"}), 500

    except Exception as e:
        error_message = str(e)
        if "unique" in error_message.lower() or "duplicate" in error_message.lower():
            # Token collision - very unlikely, but try again
            token = secrets.token_hex(32)
            try:
                result = sql_queries.fetch_one(
                    "queries/internal/criar_convite_externo.sql",
                    {
                        "cpf_convidante": cpf_convidante,
                        "documento_convidado": documento_convidado,
                        "nome_convidado": nome_convidado,
                        "email_convidado": email_convidado,
                        "telefone_convidado": telefone_convidado,
                        "id_atividade": int(id_atividade) if id_atividade else None,  # Não pode ser None se frontend está obrigando, mas deixamos para validação
                        "token": token,
                        "observacoes": observacoes,
                    },
                )
                if result:
                    # Fazer commit no retry também
                    try:
                        from flask import g
                        if hasattr(g, 'db_session') and g.db_session:
                            current_app.logger.info(f"DEBUG CREATE_INVITE - Fazendo commit da transação (retry)...")
                            g.db_session.connection.commit()
                            current_app.logger.info(f"DEBUG CREATE_INVITE - Commit realizado com sucesso (retry)!")
                    except Exception as commit_error:
                        current_app.logger.error(f"DEBUG CREATE_INVITE - Erro ao fazer commit (retry): {str(commit_error)}")
                        if hasattr(g, 'db_session') and g.db_session:
                            g.db_session.connection.rollback()
                        raise

                    return jsonify({
                        "success": True,
                        "message": "Convite criado com sucesso",
                        "invite": {
                            "id_convite": result["id_convite"],
                            "token": token,
                            "status": result["status"],
                        },
                    })
            except Exception:
                pass

        return jsonify({"success": False, "message": f"Erro ao criar convite: {error_message}"}), 500


@internal_blueprint.delete("/reservations/installation/<int:reservation_id>", endpoint="cancel_installation_reservation")
@require_role("internal", "staff", "admin")
def cancel_installation_reservation(reservation_id: int):
    """Cancel an installation reservation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    try:
        # Verify that the reservation belongs to the current user
        reservation = sql_queries.fetch_one(
            "queries/internal/verificar_reserva_instalacao.sql",
            {
                "id_reserva": reservation_id,
                "cpf_responsavel": cpf_responsavel,
            },
        )

        if not reservation:
            return jsonify({"success": False, "message": "Reserva não encontrada ou você não tem permissão para cancelá-la"}), 403

        # Cancel the reservation
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


@internal_blueprint.delete("/reservations/equipment/<int:reservation_id>", endpoint="cancel_equipment_reservation")
@require_role("internal", "staff", "admin")
def cancel_equipment_reservation(reservation_id: int):
    """Cancel an equipment reservation."""
    cpf_responsavel = session.get("user_id")
    if not cpf_responsavel:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    try:
        # Verify that the reservation belongs to the current user
        reservation = sql_queries.fetch_one(
            "queries/internal/verificar_reserva_equipamento.sql",
            {
                "id_reserva_equip": reservation_id,
                "cpf_responsavel": cpf_responsavel,
            },
        )

        if not reservation:
            return jsonify({"success": False, "message": "Reserva não encontrada ou você não tem permissão para cancelá-la"}), 403

        # Cancel the reservation
        sql_queries.execute_statement(
            "queries/staff/cancelar_reserva_equipamento.sql",
            {"id_reserva_equip": reservation_id},
        )
        return jsonify({
            "success": True,
            "message": "Reserva de equipamento cancelada com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if "não encontrada" in error_message.lower():
            return jsonify({"success": False, "message": "Reserva não encontrada"}), 404
        return jsonify({"success": False, "message": f"Erro ao cancelar reserva: {error_message}"}), 500


@internal_blueprint.delete("/invites/<int:invite_id>", endpoint="delete_invite")
@require_role("internal", "staff", "admin")
def delete_invite(invite_id: int):
    """Delete an external invite."""
    cpf_convidante = session.get("user_id")
    if not cpf_convidante:
        return jsonify({"success": False, "message": "Usuário não autenticado"}), 401

    try:
        from flask import g
        from psycopg2.extras import RealDictCursor

        # Load and execute delete query with commit
        if not hasattr(g, 'db_session') or not g.db_session:
            return jsonify({"success": False, "message": "Erro de conexão com banco de dados"}), 500

        from pathlib import Path
        sql_root = Path(__file__).resolve().parents[3] / "sql"
        query_path = sql_root / "queries/internal/deletar_convite_externo.sql"
        query = query_path.read_text(encoding="utf-8")

        # Execute DELETE with RETURNING to verify deletion
        with g.db_session.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, {
                "id_convite": invite_id,
                "cpf_convidante": cpf_convidante,
            })
            result = cursor.fetchone()

            if not result:
                return jsonify({"success": False, "message": "Convite não encontrado ou você não tem permissão para deletá-lo"}), 403

            # Commit the deletion
            g.db_session.connection.commit()

        return jsonify({
            "success": True,
            "message": "Convite deletado com sucesso",
        })
    except Exception as e:
        error_message = str(e)
        if hasattr(g, 'db_session') and g.db_session:
            g.db_session.connection.rollback()
        if "não encontrado" in error_message.lower():
            return jsonify({"success": False, "message": "Convite não encontrado"}), 404
        return jsonify({"success": False, "message": f"Erro ao deletar convite: {error_message}"}), 500
