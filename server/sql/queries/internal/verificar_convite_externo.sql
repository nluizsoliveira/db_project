-- Verificar se um convite existe e pertence ao usuário
-- Parâmetros: id_convite, cpf_convidante
SELECT id_convite, nome_convidado, status
FROM convite_externo
WHERE id_convite = %(id_convite)s
  AND cpf_convidante = %(cpf_convidante)s;
