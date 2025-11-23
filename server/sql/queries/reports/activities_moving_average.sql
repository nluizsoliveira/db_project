WITH activity_participants_by_date AS (
    SELECT
        a.id_atividade,
        a.nome AS activity_name,
        pa.data_inscricao AS enrollment_date,
        COUNT(pa.cpf_participante) AS daily_participants
    FROM atividade a
    LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
    WHERE pa.data_inscricao IS NOT NULL
    GROUP BY a.id_atividade, a.nome, pa.data_inscricao
)
SELECT
    activity_name,
    enrollment_date,
    daily_participants,
    AVG(daily_participants) OVER (
        PARTITION BY id_atividade
        ORDER BY enrollment_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_average_7_days
FROM activity_participants_by_date
ORDER BY activity_name, enrollment_date;
