-- Query to verify if an installation reservation belongs to a user
-- Parameters:
--   %(id_reserva)s - Reservation ID
--   %(cpf_responsavel)s - User CPF
SELECT id_reserva
FROM reserva
WHERE id_reserva = %(id_reserva)s
  AND cpf_responsavel_interno = %(cpf_responsavel)s;
