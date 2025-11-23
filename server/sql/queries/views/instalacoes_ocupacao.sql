-- Query para acessar a view de instalações com ocupação
SELECT * FROM vw_instalacoes_ocupacao
ORDER BY total_reservas DESC, nome_instalacao;
