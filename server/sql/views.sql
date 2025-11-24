-- Views para simplificar consultas complexas frequentemente utilizadas
-- Este arquivo contém views que abstraem a estrutura de dados e otimizam consultas recorrentes

-- ============================================
-- 1. View de Reservas Completas
-- ============================================
-- View que une reservas com informações de instalação e responsável
CREATE OR REPLACE VIEW vw_reservas_completas AS
SELECT
    r.id_reserva,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    i.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    i.capacidade AS capacidade_instalacao,
    p.cpf AS cpf_responsavel,
    p.nome AS nome_responsavel,
    p.email AS email_responsavel,
    p.celular AS celular_responsavel,
    iu.nusp AS nusp_responsavel
FROM reserva r
JOIN instalacao i ON r.id_instalacao = i.id_instalacao
JOIN interno_usp iu ON r.cpf_responsavel_interno = iu.cpf_pessoa
JOIN pessoa p ON iu.cpf_pessoa = p.cpf;

-- ============================================
-- 2. View de Atividades Completas
-- ============================================
-- View que une atividades com grupo de extensão, educador e informações de participantes
CREATE OR REPLACE VIEW vw_atividades_completas AS
SELECT
    a.id_atividade,
    a.nome AS nome_atividade,
    a.vagas_limite,
    a.data_inicio_periodo,
    a.data_fim_periodo,
    ge.nome_grupo AS grupo_extensao,
    ge.descricao AS descricao_grupo,
    p_educador.cpf AS cpf_educador,
    p_educador.nome AS nome_educador,
    ef.numero_conselho AS conselho_educador,
    os.id_ocorrencia,
    os.dia_semana,
    os.horario_inicio,
    os.horario_fim,
    i.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    COUNT(DISTINCT pa.cpf_participante) AS total_participantes,
    (a.vagas_limite - COUNT(DISTINCT pa.cpf_participante)) AS vagas_disponiveis
FROM atividade a
LEFT JOIN atividade_grupo_extensao age ON a.id_atividade = age.id_atividade
LEFT JOIN grupo_extensao ge ON age.nome_grupo = ge.nome_grupo
LEFT JOIN conduz_atividade ca ON a.id_atividade = ca.id_atividade
LEFT JOIN educador_fisico ef ON ca.cpf_educador_fisico = ef.cpf_funcionario
LEFT JOIN pessoa p_educador ON ef.cpf_funcionario = p_educador.cpf
LEFT JOIN ocorrencia_semanal os ON a.id_atividade = os.id_atividade
LEFT JOIN instalacao i ON os.id_instalacao = i.id_instalacao
LEFT JOIN participacao_atividade pa ON a.id_atividade = pa.id_atividade
GROUP BY
    a.id_atividade,
    a.nome,
    a.vagas_limite,
    a.data_inicio_periodo,
    a.data_fim_periodo,
    ge.nome_grupo,
    ge.descricao,
    p_educador.cpf,
    p_educador.nome,
    ef.numero_conselho,
    os.id_ocorrencia,
    os.dia_semana,
    os.horario_inicio,
    os.horario_fim,
    i.id_instalacao,
    i.nome,
    i.tipo;

-- ============================================
-- 3. View de Equipamentos Disponíveis
-- ============================================
-- View que mostra equipamentos disponíveis para reserva com informações completas
CREATE OR REPLACE VIEW vw_equipamentos_disponiveis AS
SELECT
    e.id_patrimonio,
    e.nome AS nome_equipamento,
    e.preco_aquisicao,
    e.data_aquisicao,
    e.eh_reservavel,
    i.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    p.cpf AS cpf_doador,
    p.nome AS nome_doador,
    d.data_doacao,
    CASE
        WHEN e.eh_reservavel = 'S' THEN 'Disponível'
        ELSE 'Não reservável'
    END AS status_disponibilidade
FROM equipamento e
LEFT JOIN instalacao i ON e.id_instalacao_local = i.id_instalacao
LEFT JOIN doacao d ON e.id_patrimonio = d.id_equipamento
LEFT JOIN pessoa p ON d.cpf_doador = p.cpf
WHERE e.eh_reservavel = 'S';

-- ============================================
-- 4. View de Instalações com Ocupação
-- ============================================
-- View que mostra instalações com informações de ocupação e reservas
CREATE OR REPLACE VIEW vw_instalacoes_ocupacao AS
SELECT
    i.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    i.capacidade,
    i.eh_reservavel,
    COUNT(DISTINCT r.id_reserva) AS total_reservas,
    COUNT(DISTINCT CASE WHEN r.data_reserva >= CURRENT_DATE THEN r.id_reserva END) AS reservas_futuras,
    COUNT(DISTINCT CASE WHEN r.data_reserva < CURRENT_DATE THEN r.id_reserva END) AS reservas_passadas,
    COUNT(DISTINCT os.id_ocorrencia) AS total_ocorrencias_semanais,
    COUNT(DISTINCT e.id_patrimonio) AS total_equipamentos,
    CASE
        WHEN i.capacidade IS NOT NULL AND i.capacidade > 0 THEN
            ROUND((COUNT(DISTINCT r.id_reserva)::NUMERIC / i.capacidade::NUMERIC) * 100, 2)
        ELSE NULL
    END AS percentual_ocupacao
FROM instalacao i
LEFT JOIN reserva r ON i.id_instalacao = r.id_instalacao
LEFT JOIN ocorrencia_semanal os ON i.id_instalacao = os.id_instalacao
LEFT JOIN equipamento e ON i.id_instalacao = e.id_instalacao_local
GROUP BY
    i.id_instalacao,
    i.nome,
    i.tipo,
    i.capacidade,
    i.eh_reservavel;

-- ============================================
-- 5. View de Reservas de Equipamentos Completas
-- ============================================
-- View que une reservas de equipamentos com informações do equipamento, instalação e responsável
CREATE OR REPLACE VIEW vw_reservas_equipamentos_completas AS
SELECT
    re.id_reserva_equip,
    re.data_reserva,
    re.horario_inicio,
    re.horario_fim,
    e.id_patrimonio AS id_equipamento,
    e.nome AS nome_equipamento,
    i.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    p.cpf AS cpf_responsavel,
    p.nome AS nome_responsavel,
    p.email AS email_responsavel,
    p.celular AS celular_responsavel,
    iu.nusp AS nusp_responsavel
FROM reserva_equipamento re
JOIN equipamento e ON re.id_equipamento = e.id_patrimonio
LEFT JOIN instalacao i ON e.id_instalacao_local = i.id_instalacao
JOIN interno_usp iu ON re.cpf_responsavel_interno = iu.cpf_pessoa
JOIN pessoa p ON iu.cpf_pessoa = p.cpf;
