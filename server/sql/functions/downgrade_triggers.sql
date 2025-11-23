-- Remover triggers
DROP TRIGGER IF EXISTS trg_validar_horario_reserva ON reserva;
DROP TRIGGER IF EXISTS trg_checar_formacao_educador ON conduz_atividade;
DROP TRIGGER IF EXISTS trg_sync_tipo_funcionario_atribuicao ON funcionario_atribuicao;
DROP TRIGGER IF EXISTS trg_sync_tipo_funcionario ON funcionario;
DROP TRIGGER IF EXISTS trg_sync_tipo_interno ON interno_usp;
DROP TRIGGER IF EXISTS trg_sync_tipo_convite_externo ON convite_externo;
DROP TRIGGER IF EXISTS trg_ensure_tipo_on_insert ON usuario_senha;

-- Remover funções associadas aos triggers
DROP FUNCTION IF EXISTS validar_horario_reserva() CASCADE;
DROP FUNCTION IF EXISTS checar_formacao_educador() CASCADE;
DROP FUNCTION IF EXISTS sync_user_type(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS trg_sync_tipo_funcionario_atribuicao() CASCADE;
DROP FUNCTION IF EXISTS trg_sync_tipo_funcionario() CASCADE;
DROP FUNCTION IF EXISTS trg_sync_tipo_interno() CASCADE;
DROP FUNCTION IF EXISTS trg_sync_tipo_convite_externo() CASCADE;
DROP FUNCTION IF EXISTS trg_ensure_tipo_on_insert() CASCADE;
