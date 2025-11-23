SELECT
    re.id_reserva_equip,
    e.nome AS nome_equipamento,
    re.data_reserva,
    re.horario_inicio,
    re.horario_fim
FROM reserva_equipamento re
JOIN equipamento e ON e.id_patrimonio = re.id_equipamento
WHERE re.cpf_responsavel_interno = %(cpf)s
ORDER BY re.data_reserva DESC, re.horario_inicio DESC;
