WITH daily_reservations AS (
    SELECT
        r.data_reserva AS reservation_date,
        COUNT(*) AS daily_count
    FROM reserva r
    GROUP BY r.data_reserva
)
SELECT
    reservation_date,
    daily_count,
    SUM(daily_count) OVER (ORDER BY reservation_date) AS cumulative_total
FROM daily_reservations
ORDER BY reservation_date;
