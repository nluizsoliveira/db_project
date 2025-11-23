-- Query para acessar a view de reservas de equipamentos completas
SELECT * FROM vw_reservas_equipamentos_completas
ORDER BY data_reserva DESC, horario_inicio DESC;
