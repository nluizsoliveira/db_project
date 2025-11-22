-- Query to create a new external invite
-- Parameters:
--   %(cpf_convidante)s - CPF of the internal user creating the invite
--   %(documento_convidado)s - Document of the invited person
--   %(nome_convidado)s - Name of the invited person
--   %(email_convidado)s - Email of the invited person (optional)
--   %(telefone_convidado)s - Phone of the invited person (optional)
--   %(id_atividade)s - Activity ID (optional)
--   %(token)s - Unique token for the invite
--   %(observacoes)s - Observations (optional)
INSERT INTO convite_externo (
    cpf_convidante,
    documento_convidado,
    nome_convidado,
    email_convidado,
    telefone_convidado,
    id_atividade,
    token,
    observacoes
)
VALUES (
    %(cpf_convidante)s,
    %(documento_convidado)s,
    %(nome_convidado)s,
    %(email_convidado)s,
    %(telefone_convidado)s,
    %(id_atividade)s,
    %(token)s,
    %(observacoes)s
)
RETURNING id_convite, status, data_convite;
