-- TRIGGER para impedir reserva fora do horário permitido:
CREATE OR REPLACE FUNCTION validar_horario_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.horario_inicio < '06:00' OR NEW.horario_fim > '22:00') THEN
        RAISE EXCEPTION 'Horário de reserva inválido (permitido: 06h–22h)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_horario_reserva ON reserva;
CREATE TRIGGER trg_validar_horario_reserva
BEFORE INSERT OR UPDATE ON reserva
FOR EACH ROW EXECUTE FUNCTION validar_horario_reserva();

-- TRIGGER para impedir que educador conduza atividade sem formação:
CREATE OR REPLACE FUNCTION checar_formacao_educador()
RETURNS TRIGGER AS $$
DECLARE
    formacao TEXT;
BEGIN
    SELECT f.formacao INTO formacao
    FROM funcionario f
    WHERE f.cpf_interno = NEW.cpf_educador_fisico;

    IF formacao IS NULL THEN
        RAISE EXCEPTION 'O educador físico precisa ter uma formação cadastrada';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_checar_formacao_educador ON conduz_atividade;
CREATE TRIGGER trg_checar_formacao_educador
BEFORE INSERT ON conduz_atividade
FOR EACH ROW EXECUTE FUNCTION checar_formacao_educador();

-- TRIGGER para impedir reservas conflitantes na mesma instalação:

-- ============================================================================
-- TRIGGERS PARA SINCRONIZAR CAMPO TIPO EM USUARIO_SENHA
-- ============================================================================
-- Estes triggers garantem que o campo TIPO seja sempre atualizado quando
-- há mudanças nas tabelas relacionadas que determinam o tipo do usuário.
-- O tipo é determinado pela função get_user_type() com prioridade:
-- Administrador > Staff > Interno > Externo

-- FUNCTION: sync_user_type
-- Atualiza o campo TIPO em USUARIO_SENHA usando get_user_type()
-- Parameters:
--   cpf_pessoa: CPF do usuário a ser atualizado
CREATE OR REPLACE FUNCTION sync_user_type(cpf_pessoa VARCHAR)
RETURNS VOID
AS $$
DECLARE
    calculated_type VARCHAR(50);
BEGIN
    -- Calcula o tipo usando a função get_user_type
    calculated_type := get_user_type(cpf_pessoa);

    -- Atualiza o campo TIPO se o usuário existir em USUARIO_SENHA
    IF EXISTS(SELECT 1 FROM usuario_senha WHERE userid = cpf_pessoa) THEN
        UPDATE usuario_senha
        SET tipo = calculated_type,
            data_ultima_alteracao = CURRENT_TIMESTAMP
        WHERE userid = cpf_pessoa;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Atualizar TIPO quando atribuição de funcionário muda
-- Dispara quando há INSERT, UPDATE ou DELETE em FUNCIONARIO_ATRIBUICAO
CREATE OR REPLACE FUNCTION trg_sync_tipo_funcionario_atribuicao()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Quando remove atribuição, recalcula tipo do funcionário
        PERFORM sync_user_type(OLD.cpf_funcionario);
        RETURN OLD;
    ELSE
        -- Quando adiciona ou atualiza atribuição, recalcula tipo
        PERFORM sync_user_type(NEW.cpf_funcionario);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_tipo_funcionario_atribuicao
AFTER INSERT OR UPDATE OR DELETE ON funcionario_atribuicao
FOR EACH ROW EXECUTE FUNCTION trg_sync_tipo_funcionario_atribuicao();

-- TRIGGER: Atualizar TIPO quando funcionário é criado/removido
-- Dispara quando há INSERT, UPDATE ou DELETE em FUNCIONARIO
CREATE OR REPLACE FUNCTION trg_sync_tipo_funcionario()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Quando remove funcionário, recalcula tipo (pode virar Interno)
        PERFORM sync_user_type(OLD.cpf_interno);
        RETURN OLD;
    ELSE
        -- Quando cria ou atualiza funcionário, recalcula tipo (pode virar Staff)
        PERFORM sync_user_type(NEW.cpf_interno);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_tipo_funcionario
AFTER INSERT OR UPDATE OR DELETE ON funcionario
FOR EACH ROW EXECUTE FUNCTION trg_sync_tipo_funcionario();

-- TRIGGER: Atualizar TIPO quando interno USP é criado/removido
-- Dispara quando há INSERT, UPDATE ou DELETE em INTERNO_USP
CREATE OR REPLACE FUNCTION trg_sync_tipo_interno()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Quando remove interno, recalcula tipo (pode virar Externo ou NULL)
        PERFORM sync_user_type(OLD.cpf_pessoa);
        RETURN OLD;
    ELSE
        -- Quando cria ou atualiza interno, recalcula tipo (pode virar Interno)
        PERFORM sync_user_type(NEW.cpf_pessoa);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_tipo_interno
AFTER INSERT OR UPDATE OR DELETE ON interno_usp
FOR EACH ROW EXECUTE FUNCTION trg_sync_tipo_interno();

-- TRIGGER: Atualizar TIPO quando convite externo é criado/aceito
-- Dispara quando há INSERT ou UPDATE em CONVITE_EXTERNO (quando status muda para ACEITO)
CREATE OR REPLACE FUNCTION trg_sync_tipo_convite_externo()
RETURNS TRIGGER AS $$
DECLARE
    cpf_externo VARCHAR(11);
BEGIN
    -- Busca o CPF do externo pelo email do convite
    SELECT p.cpf INTO cpf_externo
    FROM pessoa p
    WHERE p.email = NEW.email_convidado;

    -- Se encontrou CPF e o convite foi aceito, atualiza o tipo
    IF cpf_externo IS NOT NULL AND NEW.status = 'ACEITO' THEN
        PERFORM sync_user_type(cpf_externo);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_tipo_convite_externo
AFTER INSERT OR UPDATE ON convite_externo
FOR EACH ROW
WHEN (NEW.status = 'ACEITO')
EXECUTE FUNCTION trg_sync_tipo_convite_externo();

-- TRIGGER: Garantir TIPO preenchido na criação de USUARIO_SENHA
-- Dispara antes de INSERT em USUARIO_SENHA para garantir que TIPO seja preenchido
CREATE OR REPLACE FUNCTION trg_ensure_tipo_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    calculated_type VARCHAR(50);
BEGIN
    -- Se TIPO não foi fornecido ou é NULL, calcula usando get_user_type
    IF NEW.tipo IS NULL THEN
        calculated_type := get_user_type(NEW.userid);
        NEW.tipo := calculated_type;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ensure_tipo_on_insert
BEFORE INSERT ON usuario_senha
FOR EACH ROW EXECUTE FUNCTION trg_ensure_tipo_on_insert();
