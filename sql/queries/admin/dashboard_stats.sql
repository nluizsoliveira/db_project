WITH stats AS (
    SELECT
        'People'::text AS label,
        COUNT(*)::int AS value,
        'Registered people'::text AS description
    FROM pessoa
    UNION ALL
    SELECT
        'Internal members'::text,
        COUNT(*)::int,
        'USP internal community'::text
    FROM interno_usp
    UNION ALL
    SELECT
        'Reservations'::text,
        COUNT(*)::int,
        'Scheduled reservations'::text
    FROM reserva
    UNION ALL
    SELECT
        'Activities'::text,
        COUNT(*)::int,
        'Registered activities'::text
    FROM atividade
)
SELECT label, value, description
FROM stats;
