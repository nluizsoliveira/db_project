-- Query to verify if an equipment reservation belongs to a user
-- Parameters:
--   %(id_reserva_equip)s - Equipment reservation ID
--   %(cpf_responsavel)s - User CPF
SELECT id_reserva_equip
FROM reserva_equipamento
WHERE id_reserva_equip = %(id_reserva_equip)s
  AND cpf_responsavel_interno = %(cpf_responsavel)s;
