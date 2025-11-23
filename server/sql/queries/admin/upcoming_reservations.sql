SELECT
    r.id_reserva,
    i.nome AS installation_name,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    COALESCE(p.nome, 'Internal host not found') AS responsible_name,
    LEAD(r.data_reserva) OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS next_reservation_date,
    LEAD(r.horario_inicio) OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS next_reservation_time
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
LEFT JOIN interno_usp iu ON iu.cpf_pessoa = r.cpf_responsavel_interno
LEFT JOIN pessoa p ON p.cpf = iu.cpf_pessoa
WHERE r.data_reserva >= CURRENT_DATE
ORDER BY r.data_reserva, r.horario_inicio
LIMIT 8;
