-- FUNCTION para obter reservas de um interno USP:
CREATE OR REPLACE FUNCTION get_reservas_interno(cpf_interno VARCHAR)
RETURNS TABLE (
    id_reserva INT,
    nome_instalacao VARCHAR,
    tipo_instalacao VARCHAR,
    data_reserva DATE,
    horario_inicio TIME,
    horario_fim TIME
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id_reserva,
        i.nome AS nome_instalacao,
        i.tipo AS tipo_instalacao,
        r.data_reserva,
        r.horario_inicio,
        r.horario_fim
    FROM reserva r
    JOIN instalacao i
        ON r.id_instalacao = i.id_instalacao
    WHERE r.cpf_responsavel_interno = cpf_interno
    ORDER BY r.data_reserva, r.horario_inicio;
END;
$$ LANGUAGE plpgsql;

-- SELECT * FROM get_reservas_interno('CPF_INTERNO_EXEMPLO');

-- FUNCTION para listar instalações disponíveis em um determinado dia e horário:
CREATE OR REPLACE FUNCTION get_instalacoes_disponiveis_horario(
    dia DATE,
    hora_inicio TIME,
    hora_fim TIME
)
RETURNS TABLE (
    id_instalacao INT,
    nome VARCHAR,
    tipo VARCHAR,
    capacidade INT,
    status_disponibilidade VARCHAR,
    proxima_reserva_data DATE,
    proxima_reserva_inicio TIME,
    proxima_reserva_fim TIME,
    reserva_anterior_data DATE,
    reserva_anterior_fim TIME
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id_instalacao,
        i.nome,
        i.tipo,
        i.capacidade,
        'Disponível'::VARCHAR AS status_disponibilidade,
        (
            SELECT r_prox.data_reserva
            FROM reserva r_prox
            WHERE r_prox.id_instalacao = i.id_instalacao
              AND (
                  (r_prox.data_reserva > dia)
                  OR (r_prox.data_reserva = dia AND r_prox.horario_inicio >= hora_fim)
              )
            ORDER BY r_prox.data_reserva ASC, r_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_data,
        (
            SELECT r_prox.horario_inicio
            FROM reserva r_prox
            WHERE r_prox.id_instalacao = i.id_instalacao
              AND (
                  (r_prox.data_reserva > dia)
                  OR (r_prox.data_reserva = dia AND r_prox.horario_inicio >= hora_fim)
              )
            ORDER BY r_prox.data_reserva ASC, r_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_inicio,
        (
            SELECT r_prox.horario_fim
            FROM reserva r_prox
            WHERE r_prox.id_instalacao = i.id_instalacao
              AND (
                  (r_prox.data_reserva > dia)
                  OR (r_prox.data_reserva = dia AND r_prox.horario_inicio >= hora_fim)
              )
            ORDER BY r_prox.data_reserva ASC, r_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_fim,
        (
            SELECT r_ant.data_reserva
            FROM reserva r_ant
            WHERE r_ant.id_instalacao = i.id_instalacao
              AND (
                  (r_ant.data_reserva < dia)
                  OR (r_ant.data_reserva = dia AND r_ant.horario_fim <= hora_inicio)
              )
            ORDER BY r_ant.data_reserva DESC, r_ant.horario_fim DESC
            LIMIT 1
        ) AS reserva_anterior_data,
        (
            SELECT r_ant.horario_fim
            FROM reserva r_ant
            WHERE r_ant.id_instalacao = i.id_instalacao
              AND (
                  (r_ant.data_reserva < dia)
                  OR (r_ant.data_reserva = dia AND r_ant.horario_fim <= hora_inicio)
              )
            ORDER BY r_ant.data_reserva DESC, r_ant.horario_fim DESC
            LIMIT 1
        ) AS reserva_anterior_fim
    FROM instalacao i
    WHERE i.eh_reservavel = 'S'
      AND i.id_instalacao NOT IN (
          SELECT r.id_instalacao
          FROM reserva r
          WHERE r.data_reserva = dia
            AND (
                -- verifica se há sobreposição de horários
                (hora_inicio < r.horario_fim AND hora_fim > r.horario_inicio)
            )
      )
    ORDER BY i.nome;
END;
$$ LANGUAGE plpgsql;

-- SELECT * FROM get_instalacoes_disponiveis_horario('2023-11-10', '12:00', '14:00');

-- FUNCTION para listar equipamentos disponíveis em um determinado dia e horário:
CREATE OR REPLACE FUNCTION get_equipamentos_disponiveis_horario(
    dia DATE,
    hora_inicio TIME,
    hora_fim TIME
)
RETURNS TABLE (
    id_patrimonio VARCHAR,
    nome VARCHAR,
    local VARCHAR,
    status_disponibilidade VARCHAR,
    proxima_reserva_data DATE,
    proxima_reserva_inicio TIME,
    proxima_reserva_fim TIME,
    reserva_anterior_data DATE,
    reserva_anterior_fim TIME
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id_patrimonio,
        e.nome,
        COALESCE(i.nome, 'Sem local') AS local,
        'Disponível'::VARCHAR AS status_disponibilidade,
        (
            SELECT re_prox.data_reserva
            FROM reserva_equipamento re_prox
            WHERE re_prox.id_equipamento = e.id_patrimonio
              AND (
                  (re_prox.data_reserva > dia)
                  OR (re_prox.data_reserva = dia AND re_prox.horario_inicio >= hora_fim)
              )
            ORDER BY re_prox.data_reserva ASC, re_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_data,
        (
            SELECT re_prox.horario_inicio
            FROM reserva_equipamento re_prox
            WHERE re_prox.id_equipamento = e.id_patrimonio
              AND (
                  (re_prox.data_reserva > dia)
                  OR (re_prox.data_reserva = dia AND re_prox.horario_inicio >= hora_fim)
              )
            ORDER BY re_prox.data_reserva ASC, re_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_inicio,
        (
            SELECT re_prox.horario_fim
            FROM reserva_equipamento re_prox
            WHERE re_prox.id_equipamento = e.id_patrimonio
              AND (
                  (re_prox.data_reserva > dia)
                  OR (re_prox.data_reserva = dia AND re_prox.horario_inicio >= hora_fim)
              )
            ORDER BY re_prox.data_reserva ASC, re_prox.horario_inicio ASC
            LIMIT 1
        ) AS proxima_reserva_fim,
        (
            SELECT re_ant.data_reserva
            FROM reserva_equipamento re_ant
            WHERE re_ant.id_equipamento = e.id_patrimonio
              AND (
                  (re_ant.data_reserva < dia)
                  OR (re_ant.data_reserva = dia AND re_ant.horario_fim <= hora_inicio)
              )
            ORDER BY re_ant.data_reserva DESC, re_ant.horario_fim DESC
            LIMIT 1
        ) AS reserva_anterior_data,
        (
            SELECT re_ant.horario_fim
            FROM reserva_equipamento re_ant
            WHERE re_ant.id_equipamento = e.id_patrimonio
              AND (
                  (re_ant.data_reserva < dia)
                  OR (re_ant.data_reserva = dia AND re_ant.horario_fim <= hora_inicio)
              )
            ORDER BY re_ant.data_reserva DESC, re_ant.horario_fim DESC
            LIMIT 1
        ) AS reserva_anterior_fim
    FROM equipamento e
    LEFT JOIN instalacao i ON e.id_instalacao_local = i.id_instalacao
    WHERE e.eh_reservavel = 'S'
      AND e.id_patrimonio NOT IN (
          SELECT re.id_equipamento
          FROM reserva_equipamento re
          WHERE re.data_reserva = dia
            AND (
                -- verifica se há sobreposição de horários
                (hora_inicio < re.horario_fim AND hora_fim > re.horario_inicio)
            )
      )
    ORDER BY e.nome;
END;
$$ LANGUAGE plpgsql;

-- SELECT * FROM get_equipamentos_disponiveis_horario('2023-11-10', '12:00', '14:00');

-- FUNCTION para listar atividades com filtros opcionais:
CREATE OR REPLACE FUNCTION listar_atividades(
    p_dia_semana DIA_SEMANA DEFAULT NULL,
    p_grupo_extensao VARCHAR(100) DEFAULT NULL,
    p_modalidade VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    id_atividade INT,
    nome_atividade VARCHAR,
    grupo_extensao VARCHAR,
    dia_semana DIA_SEMANA,
    horario_inicio TIME,
    horario_fim TIME,
    vagas_ocupadas INT,
    vagas_limite INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Seleciona atividades com os filtros aplicados
    RETURN QUERY
    SELECT
        a.id_atividade,
        a.nome AS nome_atividade,
        ge.nome_grupo AS grupo_extensao,
        os.dia_semana,
        os.horario_inicio AS horario_inicio,
        os.horario_fim AS horario_fim,
        COUNT(pa.cpf_participante)::integer AS vagas_ocupadas,
        a.vagas_limite
    FROM atividade a
    LEFT JOIN atividade_grupo_extensao ag ON ag.id_atividade = a.id_atividade
    LEFT JOIN grupo_extensao ge ON ge.nome_grupo = ag.nome_grupo
    LEFT JOIN ocorrencia_semanal os ON os.id_atividade = a.id_atividade
    LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
    WHERE
        (p_dia_semana IS NULL OR os.dia_semana = p_dia_semana)
        AND (p_grupo_extensao IS NULL OR ge.nome_grupo ILIKE '%' || p_grupo_extensao || '%')
        AND (p_modalidade IS NULL OR a.nome ILIKE '%' || p_modalidade || '%')
    GROUP BY a.id_atividade, ge.nome_grupo, os.dia_semana, os.horario_inicio, os.horario_fim, a.vagas_limite
    ORDER BY os.dia_semana, os.horario_inicio;
END;
$$;

-- FUNCTION para listar grupos de extensão:
CREATE OR REPLACE FUNCTION listar_grupos_extensao()
RETURNS TABLE(nome VARCHAR, descricao TEXT, responsavel VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT G.NOME_GRUPO, G.DESCRICAO, P.NOME
    FROM GRUPO_EXTENSAO G
    JOIN PESSOA P ON G.CPF_RESPONSAVEL_INTERNO = P.CPF;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION para listar equipamentos:
CREATE OR REPLACE FUNCTION listar_equipamentos()
RETURNS TABLE(id VARCHAR, nome VARCHAR, local VARCHAR, reservavel CHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT E.ID_PATRIMONIO, E.NOME, I.NOME, E.EH_RESERVAVEL
    FROM EQUIPAMENTO E
    LEFT JOIN INSTALACAO I ON E.ID_INSTALACAO_LOCAL = I.ID_INSTALACAO;
END;
$$ LANGUAGE plpgsql;
