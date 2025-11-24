-- Deletar convite externo
-- Parâmetros: id_convite, cpf_convidante (para verificar permissão)
DELETE FROM convite_externo
WHERE id_convite = %(id_convite)s
  AND cpf_convidante = %(cpf_convidante)s
RETURNING id_convite, nome_convidado, status;
