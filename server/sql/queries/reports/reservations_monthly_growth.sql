WITH monthly_reservations AS (
    SELECT
        EXTRACT(YEAR FROM r.data_reserva) AS year,
        EXTRACT(MONTH FROM r.data_reserva) AS month,
        COUNT(*) AS reservation_count
    FROM reserva r
    GROUP BY EXTRACT(YEAR FROM r.data_reserva), EXTRACT(MONTH FROM r.data_reserva)
)
SELECT
    year,
    month,
    reservation_count AS current_month_reservations,
    LAG(reservation_count, 1) OVER (ORDER BY year, month) AS previous_month_reservations,
    reservation_count - LAG(reservation_count, 1) OVER (ORDER BY year, month) AS growth_absolute,
    CASE
        WHEN LAG(reservation_count, 1) OVER (ORDER BY year, month) > 0 THEN
            ROUND(
                ((reservation_count - LAG(reservation_count, 1) OVER (ORDER BY year, month))::DECIMAL /
                 LAG(reservation_count, 1) OVER (ORDER BY year, month)) * 100,
                2
            )
        ELSE NULL
    END AS growth_percentage
FROM monthly_reservations
ORDER BY year, month;
