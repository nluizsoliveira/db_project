-- Query to create a new event
-- Parameters:
--   %(nome)s - Event name
--   %(descricao)s - Event description
--   %(id_reserva)s - Reservation ID
CALL criar_evento(%(nome)s, %(descricao)s, %(id_reserva)s);
