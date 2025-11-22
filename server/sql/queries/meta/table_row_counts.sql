-- Contagem de tuplas por tabela

-- Pessoas
SELECT COUNT(*) AS total
FROM pessoa;

-- Internos USP
SELECT COUNT(*) AS total
FROM interno_usp;

-- Funcionários
SELECT COUNT(*) AS total
FROM funcionario;

-- Atribuições de funcionários
SELECT COUNT(*) AS total
FROM funcionario_atribuicao;

-- Restrições de funcionários
SELECT COUNT(*) AS total
FROM funcionario_restricao;

-- Educadores físicos
SELECT COUNT(*) AS total
FROM educador_fisico;

-- Instalações
SELECT COUNT(*) AS total
FROM instalacao;

-- Equipamentos
SELECT COUNT(*) AS total
FROM equipamento;

-- Doações
SELECT COUNT(*) AS total
FROM doacao;

-- Reservas
SELECT COUNT(*) AS total
FROM reserva;

-- Atividades
SELECT COUNT(*) AS total
FROM atividade;

-- Ocorrências semanais
SELECT COUNT(*) AS total
FROM ocorrencia_semanal;

-- Condução de atividades
SELECT COUNT(*) AS total
FROM conduz_atividade;

-- Participações em atividades
SELECT COUNT(*) AS total
FROM participacao_atividade;

-- Eventos
SELECT COUNT(*) AS total
FROM evento;

-- Supervisão de eventos
SELECT COUNT(*) AS total
FROM supervisao_evento;

-- Grupos de extensão
SELECT COUNT(*) AS total
FROM grupo_extensao;

-- Atividades de grupos de extensão
SELECT COUNT(*) AS total
FROM atividade_grupo_extensao;
