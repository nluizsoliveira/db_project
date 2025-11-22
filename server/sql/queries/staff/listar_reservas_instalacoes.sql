-- Query to list all installation reservations
-- Optional filters:
--   %(data_inicio)s - Start date filter
--   %(data_fim)s - End date filter
--   %(id_instalacao)s - Installation ID filter
--   %(cpf_responsavel)s - Responsible CPF filter
SELECT
    r.id_reserva,
    r.id_instalacao,
    i.nome AS nome_instalacao,
    i.tipo AS tipo_instalacao,
    r.cpf_responsavel_interno,
    p.nome AS nome_responsavel,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
JOIN pessoa p ON p.cpf = r.cpf_responsavel_interno
WHERE 1=1
    AND (%(data_inicio)s IS NULL OR r.data_reserva >= %(data_inicio)s)
    AND (%(data_fim)s IS NULL OR r.data_reserva <= %(data_fim)s)
    AND (%(id_instalacao)s IS NULL OR r.id_instalacao = %(id_instalacao)s)
    AND (%(cpf_responsavel)s IS NULL OR r.cpf_responsavel_interno = %(cpf_responsavel)s)
ORDER BY r.data_reserva DESC, r.horario_inicio DESC;
