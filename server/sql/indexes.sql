-- Índices explícitos para otimização de performance
-- Este arquivo contém índices recomendados para melhorar a performance das consultas

-- ============================================
-- 1. Índices para Foreign Keys frequentemente consultadas
-- ============================================

-- Índice para reserva.id_instalacao (usado em muitos JOINs)
CREATE INDEX IF NOT EXISTS idx_reserva_instalacao ON reserva(id_instalacao);

-- Índice para reserva.cpf_responsavel_interno (usado em filtros e JOINs)
CREATE INDEX IF NOT EXISTS idx_reserva_responsavel ON reserva(cpf_responsavel_interno);

-- Índice para participacao_atividade.id_atividade (usado em agregações)
CREATE INDEX IF NOT EXISTS idx_participacao_atividade ON participacao_atividade(id_atividade);

-- Índice para participacao_atividade.cpf_participante (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_participacao_participante ON participacao_atividade(cpf_participante);

-- Índice para reserva_equipamento.id_equipamento (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_reserva_equipamento_equip ON reserva_equipamento(id_equipamento);

-- Índice para reserva_equipamento.cpf_responsavel_interno (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_reserva_equipamento_responsavel ON reserva_equipamento(cpf_responsavel_interno);

-- Índice para ocorrencia_semanal.id_atividade (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_ocorrencia_atividade ON ocorrencia_semanal(id_atividade);

-- Índice para ocorrencia_semanal.id_instalacao (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_ocorrencia_instalacao ON ocorrencia_semanal(id_instalacao);

-- Índice para conduz_atividade.id_atividade (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_conduz_atividade ON conduz_atividade(id_atividade);

-- Índice para evento.id_reserva (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_evento_reserva ON evento(id_reserva);

-- Índice para equipamento.id_instalacao_local (usado em JOINs)
CREATE INDEX IF NOT EXISTS idx_equipamento_instalacao ON equipamento(id_instalacao_local);

-- ============================================
-- 2. Índices para colunas usadas em WHERE e JOIN
-- ============================================

-- Índice para pessoa.email (usado em autenticação e buscas)
CREATE INDEX IF NOT EXISTS idx_pessoa_email ON pessoa(email);

-- Índice para interno_usp.nusp (usado em buscas e validações)
CREATE INDEX IF NOT EXISTS idx_interno_nusp ON interno_usp(nusp);

-- Índice para reserva.data_reserva (usado em filtros de data)
CREATE INDEX IF NOT EXISTS idx_reserva_data ON reserva(data_reserva);

-- Índice para reserva_equipamento.data_reserva (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_reserva_equipamento_data ON reserva_equipamento(data_reserva);

-- Índice para atividade.data_inicio_periodo (usado em filtros de período)
CREATE INDEX IF NOT EXISTS idx_atividade_data_inicio ON atividade(data_inicio_periodo);

-- Índice para convite_externo.token (usado em buscas por token)
CREATE INDEX IF NOT EXISTS idx_convite_externo_token ON convite_externo(token);

-- Índice para convite_externo.email_convidado (usado em buscas)
CREATE INDEX IF NOT EXISTS idx_convite_externo_email ON convite_externo(email_convidado);

-- Índice para solicitacao_cadastro.status (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_solicitacao_cadastro_status ON solicitacao_cadastro(status);

-- ============================================
-- 3. Índices para colunas usadas em ORDER BY
-- ============================================

-- Índice para atividade.data_inicio_periodo (já criado acima, também usado em ORDER BY)
-- Índice adicional para ordenação por data de reserva
CREATE INDEX IF NOT EXISTS idx_reserva_data_ordem ON reserva(data_reserva DESC);

-- ============================================
-- 4. Índices compostos para queries específicas
-- ============================================

-- Índice composto para reserva (instalacao + data) - usado em relatórios
CREATE INDEX IF NOT EXISTS idx_reserva_instalacao_data ON reserva(id_instalacao, data_reserva);

-- Índice composto para reserva (responsavel + data) - usado em consultas de usuário
CREATE INDEX IF NOT EXISTS idx_reserva_responsavel_data ON reserva(cpf_responsavel_interno, data_reserva);

-- Índice composto para participacao_atividade (atividade + participante) - usado em validações
CREATE INDEX IF NOT EXISTS idx_participacao_atividade_participante ON participacao_atividade(id_atividade, cpf_participante);

-- Índice composto para ocorrencia_semanal (atividade + dia_semana) - usado em buscas
CREATE INDEX IF NOT EXISTS idx_ocorrencia_atividade_dia ON ocorrencia_semanal(id_atividade, dia_semana);

-- Índice composto para reserva_equipamento (equipamento + data) - usado em verificações de disponibilidade
CREATE INDEX IF NOT EXISTS idx_reserva_equipamento_equip_data ON reserva_equipamento(id_equipamento, data_reserva);
