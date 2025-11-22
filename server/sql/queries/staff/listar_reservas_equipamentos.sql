-- Query to list all equipment reservations
-- Optional filters:
--   %(data_inicio)s - Start date filter
--   %(data_fim)s - End date filter
--   %(id_equipamento)s - Equipment ID filter
--   %(cpf_responsavel)s - Responsible CPF filter
SELECT
    re.id_reserva_equip,
    re.id_equipamento,
    e.nome AS nome_equipamento,
    re.cpf_responsavel_interno,
    p.nome AS nome_responsavel,
    re.data_reserva,
    re.horario_inicio,
    re.horario_fim
FROM reserva_equipamento re
JOIN equipamento e ON e.id_patrimonio = re.id_equipamento
JOIN pessoa p ON p.cpf = re.cpf_responsavel_interno
WHERE 1=1
    AND (%(data_inicio)s IS NULL OR re.data_reserva >= %(data_inicio)s)
    AND (%(data_fim)s IS NULL OR re.data_reserva <= %(data_fim)s)
    AND (%(id_equipamento)s IS NULL OR re.id_equipamento = %(id_equipamento)s)
    AND (%(cpf_responsavel)s IS NULL OR re.cpf_responsavel_interno = %(cpf_responsavel)s)
ORDER BY re.data_reserva DESC, re.horario_inicio DESC;
