-- Instalações mais reservadas (apenas reserváveis)
SELECT
    i.nome,
    i.tipo,
    COUNT(r.id_reserva) AS total_reservas
FROM instalacao i
LEFT JOIN reserva r ON i.id_instalacao = r.id_instalacao
WHERE i.eh_reservavel = 'S'
GROUP BY i.id_instalacao, i.nome, i.tipo
ORDER BY total_reservas DESC;
