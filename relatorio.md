# Relatório Técnico - Projeto Final

## Sistema de Gestão de Reservas e Atividades do CEFER

**Disciplina**: SCC0641 – Laboratório de Bases de Dados
**Professor**: Mirela Teixeira Cazzolato
**PAE**: Leonardo Campos

**Autores**:
- Breno Rodrigues - 11734142
- Erick Barcelos - 11345562
- Gabriel Henrique dos Santos - 13783972
- Lourençco Roselino - 11796805
- Nelson Luiz - 9793502

---

## 📑 Sumário

- [1. Introdução](#1-introdução)
  - [1.1. Objetivo do Projeto](#11-objetivo-do-projeto)
  - [1.2. Escopo do Sistema](#12-escopo-do-sistema)
- [2. Estrutura do Banco de Dados](#2-estrutura-do-banco-de-dados)
  - [2.1. DDL (Data Definition Language)](#21-ddl-data-definition-language)
    - [2.1.1. Criação de Tabelas](#211-criação-de-tabelas)
    - [2.1.2. Tipos Enumerados](#212-tipos-enumerados)
    - [2.1.3. Constraints Implementadas](#213-constraints-implementadas)
    - [2.1.4. Scripts de Downgrade](#214-scripts-de-downgrade)
- [3. Manipulação de Dados (DML)](#3-manipulação-de-dados-dml)
  - [3.1. INSERT](#31-insert)
  - [3.2. UPDATE](#32-update)
  - [3.3. DELETE](#33-delete)
  - [3.4. SELECT](#34-select)
- [4. Consultas Analíticas - Extended Group By](#4-consultas-analíticas---extended-group-by)
  - [4.1. CUBE](#41-cube)
  - [4.2. ROLLUP](#42-rollup)
  - [4.3. GROUPING SETS](#43-grouping-sets)
- [5. Window Functions](#5-window-functions)
  - [5.1. RANK() OVER](#51-rank-over)
  - [5.2. ROW_NUMBER() OVER](#52-row_number-over)
  - [5.3. DENSE_RANK() OVER](#53-dense_rank-over)
  - [5.4. LAG() OVER](#54-lag-over)
  - [5.5. LEAD() OVER](#55-lead-over)
  - [5.6. SUM() OVER](#56-sum-over)
  - [5.7. AVG() OVER](#57-avg-over)
  - [5.8. COUNT() OVER](#58-count-over)
  - [5.9. Resumo das Window Functions](#59-resumo-das-window-functions)
- [6. PL/pgSQL](#6-plpgsql)
  - [6.1. Functions](#61-functions)
    - [6.1.1. Function que Retorna TABLE](#611-function-que-retorna-table)
    - [6.1.2. Function que Retorna JSON](#612-function-que-retorna-json)
    - [6.1.3. Function com Parâmetros e Lógica Condicional](#613-function-com-parâmetros-e-lógica-condicional)
  - [6.2. Procedures](#62-procedures)
    - [6.2.1. Procedure Simples](#621-procedure-simples)
    - [6.2.2. Procedure com Validação de Negócio](#622-procedure-com-validação-de-negócio)
  - [6.3. Características PL/pgSQL Utilizadas](#63-características-plpgsql-utilizadas)
  - [6.4. Arquivos com PL/pgSQL](#64-arquivos-com-plpgsql)
- [7. Triggers](#7-triggers)
  - [7.1. Trigger de Validação de Horário](#71-trigger-de-validação-de-horário)
  - [7.2. Trigger de Validação de Formação](#72-trigger-de-validação-de-formação)
- [8. Visões (Views)](#8-visões-views)
  - [8.1. `vw_reservas_completas`](#81-vw_reservas_completas)
  - [8.2. `vw_atividades_completas`](#82-vw_atividades_completas)
  - [8.3. `vw_equipamentos_disponiveis`](#83-vw_equipamentos_disponiveis)
  - [8.4. `vw_instalacoes_ocupacao`](#84-vw_instalacoes_ocupacao)
  - [8.5. `vw_reservas_equipamentos_completas`](#85-vw_reservas_equipamentos_completas)
  - [8.6. Integração Frontend](#86-integração-frontend)
- [9. Índices (Indexes)](#9-índices-indexes)
  - [9.1. Índices Implícitos](#91-índices-implícitos)
  - [9.2. Índices Explícitos Implementados](#92-índices-explícitos-implementados)
    - [9.2.1. Índices para Foreign Keys](#921-índices-para-foreign-keys)
    - [9.2.2. Índices para WHERE e JOIN](#922-índices-para-where-e-join)
    - [9.2.3. Índices para ORDER BY](#923-índices-para-order-by)
    - [9.2.4. Índices Compostos](#924-índices-compostos)
- [10. Segurança e Autenticação](#10-segurança-e-autenticação)
  - [10.1. Sistema de Usuários](#101-sistema-de-usuários)
    - [10.1.1. Atendimento aos Requisitos do PF](#1011-atendimento-aos-requisitos-do-pf)
    - [10.1.2. Justificativa de Design](#1012-justificativa-de-design)
  - [10.2. Log de Acessos](#102-log-de-acessos)
    - [10.2.1. Atendimento aos Requisitos do PF](#1021-atendimento-aos-requisitos-do-pf)
    - [10.2.2. Justificativa de Design](#1022-justificativa-de-design)
- [11. Relatórios Implementados](#11-relatórios-implementados)
  - [11.1. Tipos de Usuários](#111-tipos-de-usuários)
  - [11.2. Relatórios por Tipo de Usuário](#112-relatórios-por-tipo-de-usuário)
- [12. Decisões de Projeto](#12-decisões-de-projeto)
  - [12.1. Escolha do SGBD](#121-escolha-do-sgbd)
  - [12.2. Estrutura de Arquivos SQL](#122-estrutura-de-arquivos-sql)
  - [12.3. Uso de Stored Procedures](#123-uso-de-stored-procedures)
  - [12.4. Índices Estratégicos](#124-índices-estratégicos)
- [13. Conclusão](#13-conclusão)
  - [13.1. Conceitos Implementados](#131-conceitos-implementados)
  - [13.2. Características Principais](#132-características-principais)
  - [13.3. Atendimento aos Requisitos do PF](#133-atendimento-aos-requisitos-do-pf)
- [Referências](#referências)

---

## 1. Introdução

Este relatório apresenta a implementação do sistema de gestão de reservas e atividades do Centro de Educação Física e Esportes da USP (CEFER). O sistema foi desenvolvido como parte do Projeto Final da disciplina de Bases de Dados, utilizando PostgreSQL como SGBD e implementando os conceitos estudados ao longo do semestre.

### 1.1. Objetivo do Projeto

O objetivo deste trabalho é desenvolver um protótipo funcional capaz de:

- Manipular dados da aplicação através de uma interface intuitiva
- Gerar relatórios analíticos para diferentes tipos de usuários
- Fornecer mecanismos de segurança e integridade de dados
- Garantir bom desempenho nas consultas através de otimizações adequadas

### 1.2. Escopo do Sistema

O sistema gerencia:

- **Reservas de instalações** (quadras, piscinas, salas, etc.)
- **Atividades físicas** conduzidas por educadores físicos
- **Equipamentos** disponíveis para empréstimo
- **Grupos de extensão** e seus participantes
- **Eventos** e supervisões
- **Usuários** com diferentes níveis de acesso (Administrador, Staff, Interno USP, Externo)

---

## 2. Estrutura do Banco de Dados

### 2.1. DDL (Data Definition Language)

A estrutura do banco de dados foi definida através de comandos DDL no arquivo [`upgrade_schema.sql`](server/sql/upgrade_schema.sql). O schema implementa um modelo relacional completo com:

#### 2.1.1. Criação de Tabelas

O sistema possui **20+ tabelas** principais, incluindo:

- **PESSOA**: Dados pessoais básicos (CPF, nome, email, celular, data de nascimento)
- **INTERNO_USP**: Usuários internos da USP (NUSP)
- **FUNCIONARIO**: Funcionários do CEFER (formação, atribuições)
- **EDUCADOR_FISICO**: Educadores físicos (número do conselho)
- **INSTALACAO**: Instalações disponíveis para reserva
- **RESERVA**: Reservas de instalações
- **ATIVIDADE**: Atividades físicas oferecidas
- **EQUIPAMENTO**: Equipamentos disponíveis
- **GRUPO_EXTENSAO**: Grupos de extensão
- **EVENTO**: Eventos realizados

**Exemplo de criação de tabela:**

```2:11:server/sql/upgrade_schema.sql
CREATE TABLE PESSOA (
    CPF VARCHAR(11) NOT NULL,
    NOME VARCHAR(255) NOT NULL,
    EMAIL VARCHAR(255) NOT NULL,
    CELULAR VARCHAR(20),
    DATA_NASCIMENTO DATE,

    CONSTRAINT PK_PESSOA PRIMARY KEY (CPF),
    CONSTRAINT UN_PESSOA_EMAIL UNIQUE (EMAIL)
);
```

#### 2.1.2. Tipos Enumerados

O sistema utiliza tipos enumerados para garantir integridade semântica:

```164:172:server/sql/upgrade_schema.sql
CREATE TYPE DIA_SEMANA AS ENUM (
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
    'DOMINGO'
);
```

#### 2.1.3. Constraints Implementadas

O schema utiliza diversos tipos de constraints para garantir integridade:

- **PRIMARY KEY**: Identificação única de cada entidade
- **FOREIGN KEY**: Relacionamentos entre tabelas com ações CASCADE/RESTRICT
- **UNIQUE**: Garantia de unicidade (ex: email, combinação de instalação/data/horário)
- **CHECK**: Validação de valores (ex: horários permitidos, status válidos)
- **NOT NULL**: Campos obrigatórios

**Exemplo de tabela com múltiplas constraints:**

```132:150:server/sql/upgrade_schema.sql
CREATE TABLE RESERVA (
    ID_RESERVA INT GENERATED BY DEFAULT AS IDENTITY,
    ID_INSTALACAO INT NOT NULL,
    CPF_RESPONSAVEL_INTERNO VARCHAR(11) NOT NULL,
    DATA_RESERVA DATE NOT NULL,
    HORARIO_INICIO TIME NOT NULL,
    HORARIO_FIM TIME NOT NULL,

    CONSTRAINT PK_RESERVA PRIMARY KEY (ID_RESERVA),
    CONSTRAINT FK_RESERVA_INSTALACAO FOREIGN KEY (ID_INSTALACAO)
        REFERENCES INSTALACAO (ID_INSTALACAO)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT FK_RESERVA_INTERNO FOREIGN KEY (CPF_RESPONSAVEL_INTERNO)
        REFERENCES INTERNO_USP (CPF_PESSOA)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT UN_RESERVA UNIQUE (ID_INSTALACAO, DATA_RESERVA, HORARIO_INICIO)
);
```

**Justificativa**: A constraint `UN_RESERVA` impede reservas duplicadas na mesma instalação, data e horário. As foreign keys com `CASCADE` garantem que, ao deletar uma instalação ou usuário interno, suas reservas sejam automaticamente removidas, mantendo a integridade referencial.

#### 2.1.4. Scripts de Downgrade

O arquivo [`downgrade_schema.sql`](server/sql/downgrade_schema.sql) contém comandos DROP para remoção completa do schema, útil para testes e reinicialização do banco.

---

## 3. Manipulação de Dados (DML)

### 3.1. INSERT

Os comandos INSERT são executados principalmente através de stored procedures, garantindo validação e consistência:

**Exemplo em procedure:**

```3:14:server/sql/functions/admin_functions.sql
CREATE OR REPLACE PROCEDURE criar_pessoa(
    p_cpf VARCHAR,
    p_nome VARCHAR,
    p_email VARCHAR,
    p_celular VARCHAR,
    p_data_nascimento DATE
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PESSOA (CPF, NOME, EMAIL, CELULAR, DATA_NASCIMENTO)
    VALUES (p_cpf, p_nome, p_email, p_celular, p_data_nascimento);
END;
$$;
```

**INSERT com ON CONFLICT:**

Para casos onde pode haver conflito (ex: cadastro de pessoa externa via convite), utilizamos `ON CONFLICT DO UPDATE`:

```608:623:server/sql/functions/auth_functions.sql
        IF NOT pessoa_exists THEN
            INSERT INTO pessoa (cpf, nome, email, celular)
            VALUES (
                cpf_document,
                invite_record.nome_convidado,
                COALESCE(invite_record.email_convidado, cpf_document || '@externo.cefer.usp.br'),
                invite_record.telefone_convidado
            )
            ON CONFLICT (cpf) DO UPDATE
            SET nome = EXCLUDED.nome,
                email = CASE
                    WHEN EXCLUDED.email IS NOT NULL AND EXCLUDED.email != '' THEN EXCLUDED.email
                    ELSE pessoa.email
                END,
                celular = COALESCE(EXCLUDED.celular, pessoa.celular);
```

**Justificativa**: O uso de `ON CONFLICT` permite atualizar dados existentes quando um convite externo é aceito, evitando erros e mantendo dados atualizados.

### 3.2. UPDATE

Comandos UPDATE são implementados com lógica condicional para atualizações parciais:

```25:54:server/sql/functions/admin_functions.sql
CREATE OR REPLACE PROCEDURE atualizar_pessoa(
    p_cpf VARCHAR,
    p_nome_novo VARCHAR,
    p_email_novo VARCHAR,
    p_celular_novo VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_cmd TEXT;
BEGIN
    v_cmd := 'UPDATE pessoa SET ';
    -- Lógica para adicionar os updates baseado se um valor NULL foi passado
    IF p_nome_novo IS NOT NULL THEN
      v_cmd := v_cmd || ' nome = ''' || p_nome_novo || ''',';
    END IF;
    IF p_email_novo IS NOT NULL THEN
      v_cmd := v_cmd || ' email = ''' || p_email_novo || ''',';
    END IF;
    IF p_celular_novo IS NOT NULL THEN
      v_cmd := v_cmd || ' celular = ''' || p_celular_novo || ''',';
    END IF;

    -- Corta o ultimo caracter, que seria uma virgula de um dos SETs
    v_cmd := left(v_cmd, -1);
    v_cmd := v_cmd || ' WHERE cpf = ''' || p_cpf || '''';

    EXECUTE v_cmd;

    IF NOT FOUND THEN RAISE EXCEPTION 'Pessoa com CPF % não encontrada.', p_cpf; END IF;
END;
$$;
```

**Justificativa**: A atualização dinâmica permite modificar apenas os campos fornecidos, mantendo os demais inalterados. Isso oferece flexibilidade na interface administrativa.

### 3.3. DELETE

A deleção é implementada com validação de dependências e tratamento de cascata:

```57:135:server/sql/functions/admin_functions.sql
CREATE OR REPLACE PROCEDURE deletar_pessoa(p_cpf VARCHAR)
LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    RAISE NOTICE 'deletar_pessoa: Iniciando deleção da pessoa %', p_cpf;

    -- Verificar se a pessoa existe
    IF NOT EXISTS (SELECT 1 FROM PESSOA WHERE CPF = p_cpf) THEN
        RAISE EXCEPTION 'Pessoa não encontrada.';
    END IF;
    RAISE NOTICE 'deletar_pessoa: Pessoa % encontrada', p_cpf;

    -- Verificar se há dependências que impedem a deleção (RESTRICT) - ANTES de qualquer deleção
    -- RESERVA será deletada automaticamente pela FK (CASCADE) quando INTERNO_USP for deletado
    IF EXISTS (SELECT 1 FROM INTERNO_USP WHERE CPF_PESSOA = p_cpf) THEN
        SELECT COUNT(*) INTO v_count FROM RESERVA WHERE CPF_RESPONSAVEL_INTERNO = p_cpf;
        IF v_count > 0 THEN
            RAISE NOTICE 'deletar_pessoa: % reserva(s) serão deletadas automaticamente', v_count;
        END IF;
    END IF;

    -- Verificar GRUPO_EXTENSAO (apenas se a pessoa for INTERNO_USP)
    IF EXISTS (SELECT 1 FROM INTERNO_USP WHERE CPF_PESSOA = p_cpf) THEN
        SELECT COUNT(*) INTO v_count FROM GRUPO_EXTENSAO WHERE CPF_RESPONSAVEL_INTERNO = p_cpf;
        IF v_count > 0 THEN
            RAISE EXCEPTION 'Não é possível deletar a pessoa. Existem % grupo(s) de extensão associado(s) a esta pessoa.', v_count;
        END IF;
    END IF;

    -- Verificar DOACAO (qualquer pessoa pode ser doadora)
    SELECT COUNT(*) INTO v_count FROM DOACAO WHERE CPF_DOADOR = p_cpf;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Não é possível deletar a pessoa. Existem % doação(ões) associada(s) a esta pessoa.', v_count;
    END IF;

    -- Verificar EMPRESTIMO_EQUIPAMENTO (apenas se a pessoa for INTERNO_USP)
    IF EXISTS (SELECT 1 FROM INTERNO_USP WHERE CPF_PESSOA = p_cpf) THEN
        SELECT COUNT(*) INTO v_count FROM EMPRESTIMO_EQUIPAMENTO WHERE CPF_RESPONSAVEL_INTERNO = p_cpf;
        IF v_count > 0 THEN
            RAISE EXCEPTION 'Não é possível deletar a pessoa. Existem % empréstimo(s) de equipamento associado(s) a esta pessoa.', v_count;
        END IF;
    END IF;

    -- Deletar dependências em cascata (na ordem correta)
    RAISE NOTICE 'deletar_pessoa: Deletando SUPERVISAO_EVENTO (como funcionário)';
    DELETE FROM SUPERVISAO_EVENTO WHERE CPF_FUNCIONARIO = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % supervisão(ões) de evento deletada(s)', v_count;

    RAISE NOTICE 'deletar_pessoa: Deletando CONDUZ_ATIVIDADE';
    DELETE FROM CONDUZ_ATIVIDADE WHERE CPF_EDUCADOR_FISICO = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % atividade(s) conduzida(s) deletada(s)', v_count;

    -- PARTICIPACAO_ATIVIDADE.CPF_CONVIDANTE_INTERNO será SET NULL automaticamente pela FK

    RAISE NOTICE 'deletar_pessoa: Deletando CONVITE_EXTERNO';
    DELETE FROM CONVITE_EXTERNO WHERE CPF_CONVIDANTE = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % convite(s) externo(s) deletado(s)', v_count;

    RAISE NOTICE 'deletar_pessoa: Deletando RESERVA_EQUIPAMENTO';
    DELETE FROM RESERVA_EQUIPAMENTO WHERE CPF_RESPONSAVEL_INTERNO = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % reserva(s) de equipamento deletada(s)', v_count;

    RAISE NOTICE 'deletar_pessoa: Deletando PARTICIPACAO_ATIVIDADE (como participante)';
    DELETE FROM PARTICIPACAO_ATIVIDADE WHERE CPF_PARTICIPANTE = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % participação(ões) como participante deletada(s)', v_count;

    -- Deletar a pessoa principal (isso vai deletar automaticamente INTERNO_USP, FUNCIONARIO, EDUCADOR_FISICO, etc. por causa do CASCADE)
    RAISE NOTICE 'deletar_pessoa: Deletando PESSOA principal';
    DELETE FROM PESSOA WHERE CPF = p_cpf;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'deletar_pessoa: % pessoa(s) deletada(s). Concluído.', v_count;
END;
$$;
```

**Justificativa**: A procedure de deleção implementa uma estratégia híbrida: algumas dependências são deletadas em cascata automaticamente (via FK CASCADE), enquanto outras são validadas antes para impedir deleções que comprometam a integridade histórica (ex: doações, grupos de extensão). Isso garante que dados importantes não sejam perdidos acidentalmente.

### 3.4. SELECT

Consultas SELECT são amplamente utilizadas em queries e functions. Exemplo de consulta com múltiplos JOINs:

```15:20:server/sql/queries/admin/listar_usuarios.sql
FROM pessoa p
LEFT JOIN interno_usp i ON p.cpf = i.cpf_pessoa
LEFT JOIN funcionario f ON p.cpf = f.cpf_interno
LEFT JOIN educador_fisico ef ON p.cpf = ef.cpf_funcionario
ORDER BY p.nome;
```

---

## 4. Consultas Analíticas - Extended Group By

O sistema implementa consultas analíticas utilizando os três tipos de extended group by estudados na disciplina.

### 4.1. CUBE

**Arquivo**: [`queries/reports/activities_cube.sql`](server/sql/queries/reports/activities_cube.sql)

```1:12:server/sql/queries/reports/activities_cube.sql
SELECT
    COALESCE(e.numero_conselho, 'Todos') AS council_number,
    COALESCE(ge.nome_grupo, 'Todos') AS category,
    COUNT(a.id_atividade) AS total_activities
FROM conduz_atividade ca
JOIN educador_fisico e ON ca.cpf_educador_fisico = e.cpf_funcionario
JOIN funcionario f ON f.cpf_interno = e.cpf_funcionario
JOIN interno_usp iu ON iu.cpf_pessoa = f.cpf_interno
JOIN atividade a ON a.id_atividade = ca.id_atividade
LEFT JOIN atividade_grupo_extensao age ON age.id_atividade = a.id_atividade
LEFT JOIN grupo_extensao ge ON ge.nome_grupo = age.nome_grupo
GROUP BY CUBE (e.numero_conselho, ge.nome_grupo)
ORDER BY council_number, category;
```

**Funcionalidade**: Esta consulta utiliza `GROUP BY CUBE` para gerar todas as combinações possíveis de agregação entre duas dimensões:

1. **Por conselho e grupo**: Total de atividades por número de conselho do educador físico e grupo de extensão
2. **Por conselho apenas**: Total de atividades por conselho (agregação sobre todos os grupos)
3. **Por grupo apenas**: Total de atividades por grupo de extensão (agregação sobre todos os conselhos)
4. **Total geral**: Total de todas as atividades (agregação sobre todas as dimensões)

O uso de `COALESCE` transforma valores `NULL` gerados pelo CUBE (quando uma dimensão é agregada) em 'Todos', facilitando a visualização no frontend.

**Justificativa**: Permite análise multidimensional da distribuição de atividades, identificando padrões por educador físico (conselho), por grupo de extensão, e suas combinações. O CUBE gera automaticamente todas as agregações possíveis, facilitando relatórios analíticos completos.

### 4.2. ROLLUP

**Arquivo**: [`queries/reports/reservations_rollup.sql`](server/sql/queries/reports/reservations_rollup.sql)

```1:8:server/sql/queries/reports/reservations_rollup.sql
SELECT
    i.nome AS installation_name,
    EXTRACT(MONTH FROM r.data_reserva) AS month_number,
    COUNT(*) AS total_reservations
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
GROUP BY ROLLUP (i.nome, EXTRACT(MONTH FROM r.data_reserva))
ORDER BY i.nome, month_number;
```

**Funcionalidade**: Cria uma hierarquia de agregações:

1. Reservas por instalação e mês
2. Totais por instalação (soma de todos os meses)
3. Total geral (soma de todas as instalações)

**Justificativa**: Facilita análise temporal e espacial das reservas, permitindo identificar instalações mais utilizadas e padrões sazonais.

### 4.3. GROUPING SETS

**Arquivo**: [`queries/reports/participants_totals.sql`](server/sql/queries/reports/participants_totals.sql)

```1:6:server/sql/queries/reports/participants_totals.sql
SELECT
    a.nome AS activity_name,
    COUNT(pa.cpf_participante) AS total_participants
FROM participacao_atividade pa
JOIN atividade a ON a.id_atividade = pa.id_atividade
GROUP BY GROUPING SETS ((a.nome), ());
```

**Funcionalidade**: Gera duas agregações específicas:

- Total de participantes por atividade
- Total geral de participantes

**Justificativa**: Permite visualizar tanto o detalhamento por atividade quanto o panorama geral, útil para relatórios administrativos.

---

## 5. Window Functions

O projeto implementa **8 diferentes window functions** em consultas analíticas, demonstrando uso avançado deste recurso.

### 5.1. RANK() OVER

**Arquivo**: [`queries/reports/installation_ranking.sql`](server/sql/queries/reports/installation_ranking.sql)

```1:8:server/sql/queries/reports/installation_ranking.sql
SELECT
    i.nome AS installation_name,
    COUNT(r.id_reserva) AS total_reservations,
    RANK() OVER (ORDER BY COUNT(r.id_reserva) DESC) AS ranking
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
GROUP BY i.nome
ORDER BY ranking;
```

**Funcionalidade**: Classifica instalações por número de reservas. `RANK()` deixa gaps quando há empates (ex: se duas instalações têm o mesmo número de reservas, ambas recebem o mesmo ranking, e o próximo ranking pula números).

**Justificativa**: Útil para identificar instalações mais populares e alocar recursos adequadamente.

### 5.2. ROW_NUMBER() OVER

**Arquivo**: [`queries/reports/reservations_row_number.sql`](server/sql/queries/reports/reservations_row_number.sql)

```1:11:server/sql/queries/reports/reservations_row_number.sql
SELECT
    r.id_reserva,
    i.nome AS installation_name,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    p.nome AS responsible_name,
    ROW_NUMBER() OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS reservation_sequence
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
JOIN interno_usp iu ON iu.cpf_pessoa = r.cpf_responsavel_interno
JOIN pessoa p ON p.cpf = iu.cpf_pessoa
ORDER BY i.nome, r.data_reserva, r.horario_inicio;
```

**Funcionalidade**: Numera sequencialmente as reservas por instalação, ordenadas cronologicamente.

**Justificativa**: Permite identificar a ordem cronológica de reservas em cada instalação, útil para análise de padrões de uso.

### 5.3. DENSE_RANK() OVER

**Arquivo**: [`queries/reports/activities_dense_rank.sql`](server/sql/queries/reports/activities_dense_rank.sql)

```1:8:server/sql/queries/reports/activities_dense_rank.sql
SELECT
    a.nome AS activity_name,
    COUNT(pa.cpf_participante) AS total_participants,
    DENSE_RANK() OVER (ORDER BY COUNT(pa.cpf_participante) DESC) AS dense_ranking
FROM atividade a
LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
GROUP BY a.id_atividade, a.nome
ORDER BY dense_ranking, a.nome;
```

**Funcionalidade**: Classifica atividades por número de participantes. Diferente de `RANK()`, `DENSE_RANK()` não deixa gaps em empates.

**Justificativa**: Útil para identificar atividades mais populares sem gaps no ranking, facilitando a visualização.

### 5.4. LAG() OVER

**Arquivo**: [`queries/reports/reservations_monthly_growth.sql`](server/sql/queries/reports/reservations_monthly_growth.sql)

```1:20:server/sql/queries/reports/reservations_monthly_growth.sql
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
```

**Funcionalidade**: Calcula crescimento absoluto e percentual mês a mês comparando com o mês anterior.

**Justificativa**: Essencial para análise de tendências e identificação de períodos de maior/menor demanda.

### 5.5. LEAD() OVER

**Arquivo**: [`queries/admin/upcoming_reservations.sql`](server/sql/queries/admin/upcoming_reservations.sql)

```1:22:server/sql/queries/admin/upcoming_reservations.sql
SELECT
    r.id_reserva,
    i.nome AS installation_name,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    COALESCE(p.nome, 'Internal host not found') AS responsible_name,
    LEAD(r.data_reserva) OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS next_reservation_date,
    LEAD(r.horario_inicio) OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS next_reservation_time
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
LEFT JOIN interno_usp iu ON iu.cpf_pessoa = r.cpf_responsavel_interno
LEFT JOIN pessoa p ON p.cpf = iu.cpf_pessoa
WHERE r.data_reserva >= CURRENT_DATE
ORDER BY r.data_reserva, r.horario_inicio
LIMIT 8;
```

**Funcionalidade**: Mostra a próxima reserva agendada por instalação no dashboard administrativo.

**Justificativa**: Facilita o planejamento operacional, permitindo visualizar a sequência de reservas futuras.

### 5.6. SUM() OVER

**Arquivo**: [`queries/reports/reservations_cumulative.sql`](server/sql/queries/reports/reservations_cumulative.sql)

```1:12:server/sql/queries/reports/reservations_cumulative.sql
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
```

**Funcionalidade**: Calcula o total acumulado de reservas ao longo do tempo.

**Justificativa**: Mostra a tendência de crescimento acumulado, útil para análise de longo prazo.

### 5.7. AVG() OVER

**Arquivo**: [`queries/reports/activities_moving_average.sql`](server/sql/queries/reports/activities_moving_average.sql)

```1:22:server/sql/queries/reports/activities_moving_average.sql
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
```

**Funcionalidade**: Calcula média móvel de 7 dias de participantes em atividades usando frame `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`.

**Justificativa**: Suaviza variações diárias, identificando tendências reais de participação.

### 5.8. COUNT() OVER

**Arquivo**: [`queries/reports/educator_activities_count.sql`](server/sql/queries/reports/educator_activities_count.sql)

```1:16:server/sql/queries/reports/educator_activities_count.sql
SELECT
    p.nome AS educator_name,
    e.numero_conselho AS council_number,
    a.nome AS activity_name,
    a.data_inicio_periodo AS activity_start_date,
    COUNT(*) OVER (
        PARTITION BY ca.cpf_educador_fisico
        ORDER BY a.data_inicio_periodo, a.id_atividade
    ) AS cumulative_activities_count
FROM conduz_atividade ca
JOIN educador_fisico e ON e.cpf_funcionario = ca.cpf_educador_fisico
JOIN funcionario f ON f.cpf_interno = e.cpf_funcionario
JOIN interno_usp iu ON iu.cpf_pessoa = f.cpf_interno
JOIN pessoa p ON p.cpf = iu.cpf_pessoa
JOIN atividade a ON a.id_atividade = ca.id_atividade
ORDER BY p.nome, a.data_inicio_periodo, a.id_atividade;
```

**Funcionalidade**: Conta atividades acumuladas por educador físico ao longo do tempo.

**Justificativa**: Mostra a progressão de atividades conduzidas por cada educador, útil para avaliação de desempenho.

### 5.9. Resumo das Window Functions

| Window Function     | Arquivo                                                                                         | Uso Principal                              |
| ------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `RANK() OVER`       | [`installation_ranking.sql`](server/sql/queries/reports/installation_ranking.sql)               | Ranking com gaps em empates                |
| `ROW_NUMBER() OVER` | [`reservations_row_number.sql`](server/sql/queries/reports/reservations_row_number.sql)         | Numeração sequencial por partição          |
| `DENSE_RANK() OVER` | [`activities_dense_rank.sql`](server/sql/queries/reports/activities_dense_rank.sql)             | Ranking sem gaps em empates                |
| `LAG() OVER`        | [`reservations_monthly_growth.sql`](server/sql/queries/reports/reservations_monthly_growth.sql) | Acesso a valores anteriores                |
| `LEAD() OVER`       | [`admin/upcoming_reservations.sql`](server/sql/queries/admin/upcoming_reservations.sql)         | Acesso a valores futuros (Admin Dashboard) |
| `SUM() OVER`        | [`reservations_cumulative.sql`](server/sql/queries/reports/reservations_cumulative.sql)         | Soma acumulada                             |
| `AVG() OVER`        | [`activities_moving_average.sql`](server/sql/queries/reports/activities_moving_average.sql)     | Média móvel com frame                      |
| `COUNT() OVER`      | [`educator_activities_count.sql`](server/sql/queries/reports/educator_activities_count.sql)     | Contagem acumulada por partição            |

**Características avançadas utilizadas:**

- **PARTITION BY**: Divisão de janelas por grupos (instalação, educador, atividade)
- **ORDER BY**: Ordenação dentro das janelas
- **Frames (ROWS BETWEEN)**: Janelas deslizantes para médias móveis
- **Múltiplas window functions**: Uso combinado de diferentes funções na mesma query

---

## 6. PL/pgSQL

O projeto utiliza extensivamente PL/pgSQL (linguagem procedural do PostgreSQL) para implementar lógica de negócio no banco de dados, garantindo consistência e performance.

### 6.1. Functions

#### 6.1.1. Function que Retorna TABLE

```17:22:server/sql/functions/admin_functions.sql
CREATE OR REPLACE FUNCTION listar_pessoas()
RETURNS TABLE(cpf VARCHAR, nome VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT P.CPF, P.NOME, P.EMAIL FROM PESSOA P;
END;
$$ LANGUAGE plpgsql;
```

**Justificativa**: Encapsula consultas complexas, facilitando reutilização e manutenção.

#### 6.1.2. Function que Retorna JSON

```36:101:server/sql/functions/auth_functions.sql
CREATE OR REPLACE FUNCTION get_user_roles(cpf_pessoa VARCHAR)
RETURNS JSON
AS $$
DECLARE
    roles JSON;
    is_admin BOOLEAN := FALSE;
    is_staff BOOLEAN := FALSE;
    is_internal BOOLEAN := FALSE;
    is_external BOOLEAN := FALSE;
    roles_array TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check if user is admin (has 'Administrador' in FUNCIONARIO_ATRIBUICAO)
    SELECT EXISTS(
        SELECT 1
        FROM funcionario_atribuicao fa
        JOIN funcionario f ON fa.cpf_funcionario = f.cpf_interno
        WHERE f.cpf_interno = cpf_pessoa
        AND fa.atribuicao LIKE '%Administrador%'
    ) INTO is_admin;

    -- Check if user is staff (exists in FUNCIONARIO)
    SELECT EXISTS(
        SELECT 1
        FROM funcionario
        WHERE cpf_interno = cpf_pessoa
    ) INTO is_staff;

    -- Check if user is internal (exists in INTERNO_USP)
    SELECT EXISTS(
        SELECT 1
        FROM interno_usp
        WHERE interno_usp.cpf_pessoa = get_user_roles.cpf_pessoa
    ) INTO is_internal;

    -- Check if user is external (exists in PESSOA but not in INTERNO_USP and has CONVITE_EXTERNO)
    SELECT EXISTS(
        SELECT 1
        FROM pessoa p
        WHERE p.cpf = cpf_pessoa
        AND NOT EXISTS (
            SELECT 1 FROM interno_usp i WHERE i.cpf_pessoa = p.cpf
        )
        AND EXISTS (
            SELECT 1 FROM convite_externo ce WHERE ce.email_convidado = p.email
        )
    ) INTO is_external;

    -- Build roles array
    IF is_admin THEN
        roles_array := array_append(roles_array, 'admin');
    END IF;
    IF is_staff THEN
        roles_array := array_append(roles_array, 'staff');
    END IF;
    IF is_internal THEN
        roles_array := array_append(roles_array, 'internal');
    END IF;
    IF is_external THEN
        roles_array := array_append(roles_array, 'external');
    END IF;

    -- Return as JSON
    roles := json_build_object('roles', roles_array);
    RETURN roles;
END;
$$ LANGUAGE plpgsql;
```

**Justificativa**: Centraliza a lógica de determinação de roles, garantindo consistência na autenticação e autorização. O retorno em JSON facilita integração com APIs.

#### 6.1.3. Function com Parâmetros e Lógica Condicional

```104:145:server/sql/functions/internal_functions.sql
CREATE OR REPLACE FUNCTION listar_atividades(
    p_dia_semana DIA_SEMANA DEFAULT NULL,
    p_grupo_extensao VARCHAR(100) DEFAULT NULL,
    p_modalidade VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    id_atividade INT,
    nome_atividade VARCHAR,
    grupo_extensao VARCHAR,
    dia_semana DIA_SEMANA,
    horario_inicio TIME,
    horario_fim TIME,
    vagas_ocupadas INT,
    vagas_limite INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Seleciona atividades com os filtros aplicados
    RETURN QUERY
    SELECT
        a.id_atividade,
        a.nome AS nome_atividade,
        ge.nome_grupo AS grupo_extensao,
        os.dia_semana,
        os.horario_inicio AS horario_inicio,
        os.horario_fim AS horario_fim,
        COUNT(pa.cpf_participante)::integer AS vagas_ocupadas,
        a.vagas_limite
    FROM atividade a
    LEFT JOIN atividade_grupo_extensao ag ON ag.id_atividade = a.id_atividade
    LEFT JOIN grupo_extensao ge ON ge.nome_grupo = ag.nome_grupo
    LEFT JOIN ocorrencia_semanal os ON os.id_atividade = a.id_atividade
    LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
    WHERE
        (p_dia_semana IS NULL OR os.dia_semana = p_dia_semana)
        AND (p_grupo_extensao IS NULL OR ge.nome_grupo ILIKE '%' || p_grupo_extensao || '%')
        AND (p_modalidade IS NULL OR a.nome ILIKE '%' || p_modalidade || '%')
    GROUP BY a.id_atividade, ge.nome_grupo, os.dia_semana, os.horario_inicio, os.horario_fim, a.vagas_limite
    ORDER BY os.dia_semana, os.horario_inicio;
END;
$$;
```

**Justificativa**: Permite busca flexível com filtros opcionais, melhorando a experiência do usuário na interface de consulta de atividades.

### 6.2. Procedures

#### 6.2.1. Procedure Simples

```3:14:server/sql/functions/admin_functions.sql
CREATE OR REPLACE PROCEDURE criar_pessoa(
    p_cpf VARCHAR,
    p_nome VARCHAR,
    p_email VARCHAR,
    p_celular VARCHAR,
    p_data_nascimento DATE
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PESSOA (CPF, NOME, EMAIL, CELULAR, DATA_NASCIMENTO)
    VALUES (p_cpf, p_nome, p_email, p_celular, p_data_nascimento);
END;
$$;
```

#### 6.2.2. Procedure com Validação de Negócio

```208:253:server/sql/functions/staff_functions.sql
CREATE OR REPLACE PROCEDURE inscrever_participante_atividade(
    p_cpf_participante VARCHAR(11),
    p_id_atividade INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verifica se a atividade existe
    IF NOT EXISTS (
        SELECT 1
        FROM atividade
        WHERE id_atividade = p_id_atividade
    ) THEN
        RAISE EXCEPTION 'A atividade com ID % não existe.', p_id_atividade;
    END IF;

    -- Verifica se o participante já está inscrito na atividade
    IF EXISTS (
        SELECT 1
        FROM participacao_atividade
        WHERE cpf_participante = p_cpf_participante
        AND id_atividade = p_id_atividade
    ) THEN
        RAISE NOTICE 'O participante já está inscrito nesta atividade.';
        RETURN;
    END IF;

    -- Verifica se há vagas disponíveis para a atividade
    IF EXISTS (
        SELECT 1
        FROM atividade a
        LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
        WHERE a.id_atividade = p_id_atividade
        GROUP BY a.vagas_limite
        HAVING COUNT(pa.cpf_participante) >= a.vagas_limite
    ) THEN
        RAISE EXCEPTION 'A atividade com ID % já está com as vagas esgotadas.', p_id_atividade;
    END IF;

    -- Inscreve o participante na atividade
    INSERT INTO participacao_atividade (cpf_participante, id_atividade, data_inscricao)
    VALUES (p_cpf_participante, p_id_atividade, CURRENT_DATE);

    RAISE NOTICE 'Inscrição realizada com sucesso para a atividade com ID %.', p_id_atividade;
END;
$$;
```

**Justificativa**: Encapsula regras de negócio complexas (validação de existência, duplicidade, vagas) no banco de dados, garantindo integridade mesmo se múltiplas aplicações acessarem o banco.

### 6.3. Características PL/pgSQL Utilizadas

- **DECLARE**: Declaração de variáveis
- **BEGIN/END**: Blocos de código
- **IF/THEN/ELSE**: Estruturas condicionais
- **EXCEPTION**: Tratamento de erros
- **RAISE**: Geração de mensagens e exceções
- **RETURN QUERY**: Retorno de resultados de queries
- **EXECUTE**: Execução dinâmica de SQL
- **GET DIAGNOSTICS**: Obtenção de informações sobre execução

### 6.4. Arquivos com PL/pgSQL

- [`functions/admin_functions.sql`](server/sql/functions/admin_functions.sql) - Functions e procedures administrativas
- [`functions/auth_functions.sql`](server/sql/functions/auth_functions.sql) - Functions de autenticação
- [`functions/internal_functions.sql`](server/sql/functions/internal_functions.sql) - Functions para usuários internos
- [`functions/staff_functions.sql`](server/sql/functions/staff_functions.sql) - Functions para staff
- [`functions/common_triggers.sql`](server/sql/functions/common_triggers.sql) - Functions de triggers

---

## 7. Triggers

Os triggers implementam validações de regras de negócio no nível do banco de dados, garantindo integridade mesmo em operações diretas no banco.

### 7.1. Trigger de Validação de Horário

```1:14:server/sql/functions/common_triggers.sql
-- TRIGGER para impedir reserva fora do horário permitido:
CREATE OR REPLACE FUNCTION validar_horario_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.horario_inicio < '06:00' OR NEW.horario_fim > '22:00') THEN
        RAISE EXCEPTION 'Horário de reserva inválido (permitido: 06h–22h)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_horario_reserva
BEFORE INSERT OR UPDATE ON reserva
FOR EACH ROW EXECUTE FUNCTION validar_horario_reserva();
```

**Justificativa**: Garante que reservas só sejam feitas no horário de funcionamento do CEFER (06h-22h), impedindo erros de digitação ou tentativas de reserva fora do horário permitido.

### 7.2. Trigger de Validação de Formação

```17:35:server/sql/functions/common_triggers.sql
-- TRIGGER para impedir que educador conduza atividade sem formação:
CREATE OR REPLACE FUNCTION checar_formacao_educador()
RETURNS TRIGGER AS $$
DECLARE
    formacao TEXT;
BEGIN
    SELECT f.formacao INTO formacao
    FROM funcionario f
    WHERE f.cpf_interno = NEW.cpf_educador_fisico;

    IF formacao IS NULL THEN
        RAISE EXCEPTION 'O educador físico precisa ter uma formação cadastrada';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_checar_formacao_educador
BEFORE INSERT ON conduz_atividade
FOR EACH ROW EXECUTE FUNCTION checar_formacao_educador();
```

**Justificativa**: Garante que apenas educadores físicos com formação cadastrada possam conduzir atividades, mantendo a qualidade e conformidade do serviço.

**Características dos Triggers:**

- **BEFORE INSERT/UPDATE**: Executados antes da operação, permitindo validação e modificação
- **FOR EACH ROW**: Executados para cada linha afetada
- **NEW**: Referência à nova linha (INSERT/UPDATE)
- **OLD**: Referência à linha antiga (UPDATE/DELETE)

---

## 8. Visões (Views)

O projeto implementa **5 views** que simplificam consultas complexas e abstraem a estrutura de dados para o frontend.

### 8.1. `vw_reservas_completas`

**Arquivo**: [`server/sql/views.sql`](server/sql/views.sql) (linhas 7-25)

View que une reservas com informações completas de instalação e responsável:

- Dados da reserva (id, data, horários)
- Informações da instalação (nome, tipo, capacidade)
- Dados do responsável (nome, email, celular, NUSP, categoria)

**Justificativa**: Simplifica consultas frequentes no frontend, evitando repetição de JOINs complexos e melhorando a manutenibilidade.

### 8.2. `vw_atividades_completas`

**Arquivo**: [`server/sql/views.sql`](server/sql/views.sql) (linhas 30-80)

View que consolida atividades com grupo de extensão, educador e informações de participantes:

- Dados da atividade (nome, vagas, período)
- Grupo de extensão associado
- Educador responsável (nome, conselho)
- Ocorrências semanais (dia, horário, instalação)
- Total de participantes e vagas disponíveis

**Justificativa**: Facilita a exibição de informações completas de atividades na interface, calculando automaticamente vagas ocupadas.

### 8.3. `vw_equipamentos_disponiveis`

**Arquivo**: [`server/sql/views.sql`](server/sql/views.sql) (linhas 85-107)

View que mostra equipamentos disponíveis para reserva com informações completas:

- Dados do equipamento (patrimônio, nome, preço, data de aquisição)
- Instalação onde está localizado
- Informações do doador (se aplicável)
- Status de disponibilidade

**Justificativa**: Centraliza a lógica de disponibilidade de equipamentos, facilitando consultas e relatórios.

### 8.4. `vw_instalacoes_ocupacao`

**Arquivo**: [`server/sql/views.sql`](server/sql/views.sql) (linhas 112-141)

View que apresenta instalações com métricas de ocupação:

- Dados da instalação (nome, tipo, capacidade)
- Total de reservas (futuras e passadas)
- Ocorrências semanais de atividades
- Total de equipamentos
- Percentual de ocupação calculado

**Justificativa**: Fornece métricas agregadas de ocupação, essenciais para análise de utilização de recursos.

### 8.5. `vw_reservas_equipamentos_completas`

**Arquivo**: [`server/sql/views.sql`](server/sql/views.sql) (linhas 145-167)

View que une reservas de equipamentos com informações completas:

- Dados da reserva de equipamento (id, data, horários)
- Informações do equipamento (patrimônio, nome)
- Instalação onde o equipamento está localizado
- Dados do responsável (nome, email, celular, NUSP, categoria)

**Justificativa**: Simplifica consultas de reservas de equipamentos, unificando informações que seriam obtidas através de múltiplos JOINs, facilitando relatórios e visualizações no frontend.

### 8.6. Integração Frontend

As views são acessíveis através de:

- **Backend**: Rotas em [`server/app/routes/views/api.py`](server/app/routes/views/api.py)
  - `GET /views/reservas-completas`
  - `GET /views/atividades-completas`
  - `GET /views/equipamentos-disponiveis`
  - `GET /views/instalacoes-ocupacao`
  - `GET /views/reservas-equipamentos-completas`
- **Frontend**: Página em [`client/app/views/page.tsx`](client/app/views/page.tsx) com componentes modulares para visualização

---

## 9. Índices (Indexes)

O projeto implementa **25 índices explícitos** para otimização de performance, além dos índices implícitos criados automaticamente pelo PostgreSQL.

### 9.1. Índices Implícitos

O PostgreSQL cria automaticamente índices para:

- **PRIMARY KEY**: Cada tabela tem um índice único para sua chave primária
- **UNIQUE constraints**: Índices únicos são criados automaticamente

**Exemplo:**

```9:10:server/sql/upgrade_schema.sql
    CONSTRAINT PK_PESSOA PRIMARY KEY (CPF),
    CONSTRAINT UN_PESSOA_EMAIL UNIQUE (EMAIL)
```

Estes constraints criam automaticamente:

- Índice único em `PESSOA.CPF` (PRIMARY KEY)
- Índice único em `PESSOA.EMAIL` (UNIQUE constraint)

### 9.2. Índices Explícitos Implementados

**Arquivo**: [`server/sql/indexes.sql`](server/sql/indexes.sql)

#### 9.2.1. Índices para Foreign Keys

Criados em foreign keys frequentemente consultadas para otimizar JOINs:

- `idx_reserva_instalacao` - Otimiza JOINs e filtros por instalação
- `idx_reserva_responsavel` - Otimiza consultas por responsável
- `idx_participacao_atividade` - Otimiza agregações de participantes
- `idx_participacao_participante` - Otimiza filtros por participante
- `idx_reserva_equipamento_equip` - Otimiza JOINs de equipamentos
- `idx_reserva_equipamento_responsavel` - Otimiza filtros de responsável
- `idx_ocorrencia_atividade` - Otimiza JOINs de ocorrências semanais
- `idx_ocorrencia_instalacao` - Otimiza JOINs por instalação
- `idx_conduz_atividade` - Otimiza JOINs de atividades conduzidas
- `idx_evento_reserva` - Otimiza JOINs de eventos
- `idx_equipamento_instalacao` - Otimiza JOINs de equipamentos

**Justificativa**: Foreign keys são frequentemente usadas em JOINs. Índices explícitos melhoram significativamente a performance dessas operações.

#### 9.2.2. Índices para WHERE e JOIN

Criados em colunas usadas frequentemente em cláusulas WHERE:

- `idx_pessoa_email` - Otimiza autenticação e buscas por email
- `idx_interno_nusp` - Otimiza buscas e validações por NUSP
- `idx_reserva_data` - Otimiza filtros por data de reserva
- `idx_reserva_equipamento_data` - Otimiza filtros de reserva de equipamento
- `idx_atividade_data_inicio` - Otimiza filtros por período
- `idx_convite_externo_token` - Otimiza buscas por token
- `idx_convite_externo_email` - Otimiza buscas por email
- `idx_solicitacao_cadastro_status` - Otimiza filtros por status

**Justificativa**: Consultas por email, NUSP, data e status são muito frequentes. Índices nessas colunas reduzem drasticamente o tempo de busca.

#### 9.2.3. Índices para ORDER BY

- `idx_reserva_data_ordem` - Otimiza ordenação por data (DESC)

**Justificativa**: Relatórios frequentemente ordenam reservas por data. Um índice ordenado melhora a performance de ORDER BY.

#### 9.2.4. Índices Compostos

Criados para queries específicas que filtram por múltiplas colunas:

- `idx_reserva_instalacao_data` - Otimiza relatórios por instalação e data
- `idx_reserva_responsavel_data` - Otimiza consultas de usuário por responsável e data
- `idx_participacao_atividade_participante` - Otimiza validações de participação
- `idx_ocorrencia_atividade_dia` - Otimiza buscas por atividade e dia da semana
- `idx_reserva_equipamento_equip_data` - Otimiza verificações de disponibilidade

**Justificativa**: Índices compostos são essenciais quando queries filtram por múltiplas colunas simultaneamente, permitindo que o PostgreSQL use o índice completo em vez de scan sequencial.

**Total**: 25 índices explícitos implementados para otimização de performance.

---

## 10. Segurança e Autenticação

### 10.1. Sistema de Usuários

O sistema implementa autenticação através da tabela `USUARIO_SENHA`, que **atende completamente aos requisitos funcionais** da tabela `USERS` especificada no PF. A estrutura implementada não apenas cumpre os requisitos mínimos, mas também os supera com funcionalidades adicionais de segurança e auditoria.

#### 10.1.1. Atendimento aos Requisitos do PF

**Especificação do PF (Tabela USERS):**
- UserID, Login, Senha, Tipo, IdOriginal
- Senha deve utilizar função MD5 do SGBD

**Implementação (Tabela USUARIO_SENHA):**

| Requisito PF | Campo Implementado | Justificativa |
|--------------|-------------------|--------------|
| **UserID** | **CPF** (PK) | O CPF é o identificador único natural do usuário no sistema. Utilizar CPF diretamente elimina redundância e mantém integridade referencial com a tabela PESSOA. O CPF cumpre a função de UserID de forma mais eficiente, pois já é único e não requer geração de IDs artificiais. |
| **Login** | **LOGIN** | Campo implementado exatamente como especificado, armazenando o email do usuário (VARCHAR(255)). |
| **Senha** | **SENHA** | Campo implementado com hash MD5 usando função `md5()` do PostgreSQL, conforme exigido. |
| **Tipo** | **TIPO** | Campo implementado com valores: 'Administrador', 'Staff', 'Interno', 'Externo'. O tipo é determinado automaticamente através da função `get_user_type(CPF)` baseado nos relacionamentos do usuário no sistema. |
| **IdOriginal** | **CPF** (mesmo campo) | O CPF já é o identificador original na tabela PESSOA. Não há necessidade de campo separado, pois o CPF em si já serve como referência à tabela de origem. Esta abordagem elimina redundância e mantém normalização do banco de dados. |

**Estrutura da tabela `USUARIO_SENHA`:**

- **CPF** (PK): Identificador único do usuário (VARCHAR(11), chave primária e FK para PESSOA.CPF) - *Equivale a UserID e IdOriginal*
- **LOGIN**: Email do usuário (VARCHAR(255), obtido da tabela PESSOA) - *Conforme especificação*
- **SENHA**: Hash MD5 da senha (VARCHAR(255), usando função `md5()` do PostgreSQL) - *Conforme especificação*
- **TIPO**: Tipo de usuário (VARCHAR(50), valores: 'Administrador', 'Staff', 'Interno', 'Externo') - *Conforme especificação*

**Campos adicionais para funcionalidades do sistema:**

- **SENHA_HASH**: Mantido (mesmo valor que SENHA) para compatibilidade com código existente
- **DATA_CRIACAO**: Timestamp de criação da conta
- **DATA_ULTIMA_ALTERACAO**: Timestamp da última alteração de senha
- **BLOQUEADO**: Flag indicando se a conta está bloqueada
- **TENTATIVAS_LOGIN**: Contador de tentativas de login falhadas
- **DATA_ULTIMO_LOGIN**: Timestamp do último login bem-sucedido

**Determinação do Tipo de Usuário:**
O campo `TIPO` é preenchido automaticamente através da função `get_user_type(CPF)`, que verifica relacionamentos nas tabelas do sistema seguindo a prioridade:

1. **Administrador**: Se possui atribuição 'Administrador' em `FUNCIONARIO_ATRIBUICAO`
2. **Staff**: Se existe em `FUNCIONARIO`
3. **Interno**: Se existe em `INTERNO_USP`
4. **Externo**: Se existe em `PESSOA` mas não em `INTERNO_USP` e possui `CONVITE_EXTERNO`

#### 10.1.2. Justificativa de Design

**Por que CPF ao invés de UserID separado?**

1. **Eliminação de Redundância**: O CPF já é o identificador único natural de cada pessoa no sistema. Criar um UserID separado seria redundante e violaria princípios de normalização.

2. **Integridade Referencial**: Utilizar CPF diretamente como chave primária mantém integridade referencial natural com a tabela PESSOA, sem necessidade de joins adicionais ou campos intermediários.

3. **Simplicidade e Performance**: Menos campos significam menos complexidade, menos índices necessários e melhor performance em consultas.

4. **IdOriginal Implícito**: O CPF em si já é o "IdOriginal" - é o identificador na tabela de origem (PESSOA). Não há necessidade de campo separado quando a chave primária já serve esse propósito.

**Por que o nome USUARIO_SENHA ao invés de USERS?**

A escolha do nome `USUARIO_SENHA` foi feita para:
- **Clareza semântica**: O nome descreve explicitamente que a tabela armazena usuários e suas senhas
- **Consistência com nomenclatura do projeto**: Todas as tabelas do sistema utilizam nomenclatura em português e descritiva
- **Funcionalidade equivalente**: A tabela `USUARIO_SENHA` atende **completamente** aos requisitos funcionais especificados para `USERS` no PF, com todos os campos necessários e funcionalidades adicionais

**Conclusão**: A implementação da tabela `USUARIO_SENHA` **atende e supera** os requisitos especificados para `USERS` no PF, mantendo todos os campos funcionais necessários enquanto elimina redundâncias e adiciona funcionalidades de segurança avançadas.

### 10.2. Log de Acessos

A tabela `AUDITORIA_LOGIN` **atende completamente aos requisitos funcionais** da tabela `log_table` especificada no PF, fornecendo funcionalidades de auditoria que vão além dos requisitos mínimos.

#### 10.2.1. Atendimento aos Requisitos do PF

**Especificação do PF (Tabela log_table):**
- UserID, data e hora do login

**Implementação (Tabela AUDITORIA_LOGIN):**

| Requisito PF | Campo Implementado | Justificativa |
|--------------|-------------------|--------------|
| **UserID** | **CPF** | O CPF identifica o usuário, mantendo consistência com a tabela USUARIO_SENHA. O CPF pode ser NULL para registrar tentativas de login falhadas onde o usuário não foi identificado, permitindo auditoria completa mesmo em casos de falha de autenticação. |
| **Data e hora do login** | **DATA_HORA_LOGIN** | Campo implementado como TIMESTAMP com valor padrão CURRENT_TIMESTAMP, registrando automaticamente a data e hora de cada evento de login. |

**Estrutura da tabela `AUDITORIA_LOGIN` (conforme especificação do PF):**

- **CPF**: Identificador do usuário (VARCHAR(11), foreign key para USUARIO_SENHA.CPF, pode ser NULL para tentativas de login falhadas) - *Equivale a UserID*
- **DATA_HORA_LOGIN**: Data e hora do login (TIMESTAMP, valor padrão CURRENT_TIMESTAMP) - *Conforme especificação*

**Campos adicionais para funcionalidades do sistema:**

- **ID_LOG**: Identificador único do registro (INT, chave primária) - *Necessário para identificação única de cada log*
- **TIMESTAMP_EVENTO**: Mantido (mesmo valor que DATA_HORA_LOGIN) para compatibilidade com código existente
- **EMAIL_USUARIO**: Email do usuário (permite identificar tentativas mesmo quando CPF não está disponível) - *Melhora auditoria de tentativas falhadas*
- **IP_ORIGEM**: Endereço IP de origem da tentativa - *Essencial para segurança e detecção de ataques*
- **STATUS**: Status do login ('SUCCESS', 'FAILURE', 'LOCKED') - *Permite análise de padrões de acesso*
- **MENSAGEM**: Mensagem descritiva do evento - *Facilita debugging e análise de problemas*

#### 10.2.2. Justificativa de Design

**Por que CPF ao invés de UserID separado?**

1. **Consistência com USUARIO_SENHA**: Utilizar CPF mantém consistência com a tabela de usuários, facilitando joins e consultas.

2. **Suporte a Tentativas Falhadas**: Permitir CPF NULL é essencial para registrar tentativas de login onde o usuário não foi identificado (senha incorreta, usuário inexistente). Isso permite auditoria completa de segurança.

3. **Integridade Referencial**: Quando CPF não é NULL, a foreign key garante que apenas usuários válidos sejam referenciados.

**Por que o nome AUDITORIA_LOGIN ao invés de log_table?**

A escolha do nome `AUDITORIA_LOGIN` foi feita para:
- **Clareza semântica**: O nome descreve explicitamente que a tabela armazena logs de auditoria de acessos
- **Consistência com nomenclatura do projeto**: Todas as tabelas do sistema utilizam nomenclatura em português e descritiva
- **Funcionalidade equivalente**: A tabela `AUDITORIA_LOGIN` atende **completamente** aos requisitos funcionais especificados para `log_table` no PF, com todos os campos necessários e funcionalidades adicionais de segurança

**Vantagens da Implementação:**

1. **Auditoria Completa**: Registra tanto logins bem-sucedidos quanto falhados, permitindo análise completa de segurança
2. **Rastreabilidade**: Campos adicionais (IP, STATUS, MENSAGEM) permitem rastreamento detalhado de eventos
3. **Análise de Segurança**: Facilita identificação de padrões suspeitos, tentativas de força bruta e acessos não autorizados

**Conclusão**: A implementação da tabela `AUDITORIA_LOGIN` **atende e supera** os requisitos especificados para `log_table` no PF, fornecendo todos os campos necessários enquanto adiciona funcionalidades essenciais de segurança e auditoria que são práticas recomendadas em sistemas de produção.

---

## 11. Relatórios Implementados

O sistema implementa múltiplos relatórios para diferentes tipos de usuários, atendendo ao requisito **nRel ≥ (nUser × 2)**.

### 11.1. Tipos de Usuários

1. **Administrador**: Acesso completo ao sistema
2. **Staff**: Funcionários do CEFER
3. **Interno**: Usuários internos da USP
4. **Externo**: Usuários externos convidados

### 11.2. Relatórios por Tipo de Usuário

#### Administrador

- Ranking de instalações por reservas
- Crescimento mensal de reservas
- Atividades por educador e grupo de extensão (CUBE)
- ROLLUP de reservas por instalação e mês
- Totais de participantes (GROUPING SETS)
- Reservas futuras com LEAD
- Média móvel de participantes em atividades
- Contagem acumulada de atividades por educador

#### Staff

- Reservas ativas
- Atividades com vagas disponíveis
- Equipamentos disponíveis
- Ocupação de instalações

#### Interno

- Minhas reservas
- Atividades disponíveis para inscrição
- Minhas participações em atividades

#### Externo

- Atividades disponíveis
- Informações de convites recebidos

**Total de relatórios**: Mais de 12 relatórios implementados, atendendo e superando o requisito mínimo.

---

## 12. Decisões de Projeto

### 12.1. Escolha do SGBD

**PostgreSQL 17** foi escolhido por:

- Suporte completo a PL/pgSQL
- Window functions avançadas
- Tipos enumerados nativos
- Índices compostos e parciais
- Performance superior em consultas analíticas

### 12.2. Estrutura de Arquivos SQL

Os arquivos SQL foram organizados em:

- `upgrade_schema.sql`: Schema completo
- `downgrade_schema.sql`: Remoção do schema
- `functions/`: Functions e procedures organizadas por contexto
- `queries/`: Queries organizadas por tipo (admin, reports, etc.)
- `views.sql`: Views do sistema
- `indexes.sql`: Índices explícitos

**Justificativa**: Organização modular facilita manutenção, versionamento e compreensão do código.

### 12.3. Uso de Stored Procedures

A lógica de negócio foi implementada principalmente em stored procedures para:

- **Consistência**: Garantir que regras de negócio sejam sempre aplicadas
- **Performance**: Reduzir round-trips entre aplicação e banco
- **Segurança**: Controlar acesso através de permissões de procedures
- **Manutenibilidade**: Centralizar lógica de negócio

### 12.4. Índices Estratégicos

Índices foram criados baseados em:

- **Análise de queries**: Identificação de colunas mais consultadas
- **Foreign keys**: Todas as FKs têm índices para otimizar JOINs
- **Filtros frequentes**: Email, NUSP, datas, status
- **Ordenações**: Colunas usadas em ORDER BY

**Justificativa**: Índices bem planejados melhoram significativamente a performance sem aumentar excessivamente o custo de escrita.

---

## 13. Conclusão

Este projeto demonstra a implementação completa de um sistema de gestão utilizando os conceitos estudados na disciplina de Bases de Dados:

### 13.1. Conceitos Implementados

✅ **DDL**: Estrutura completa do banco com constraints, tipos enumerados e identidades
✅ **DML**: INSERT, UPDATE, DELETE com validações e tratamento de conflitos
✅ **Extended Group By**: CUBE, ROLLUP e GROUPING SETS em relatórios analíticos
✅ **Window Functions**: 8 funções diferentes (RANK, ROW_NUMBER, DENSE_RANK, LAG, LEAD, SUM, AVG, COUNT)
✅ **PL/pgSQL**: Functions e procedures com lógica de negócio complexa
✅ **Triggers**: Validação de regras de negócio no nível do banco
✅ **Views**: 5 views para simplificar consultas e abstrair estrutura
✅ **Índices**: 25 índices explícitos para otimização de performance
✅ **Segurança**: Sistema de autenticação com hash MD5 e log de acessos
✅ **Relatórios**: Múltiplos relatórios para diferentes tipos de usuários

### 13.2. Características Principais

- **Integridade**: Constraints, triggers e procedures garantem consistência dos dados
- **Performance**: Índices estratégicos otimizam consultas frequentes
- **Manutenibilidade**: Código organizado e documentado
- **Usabilidade**: Interface intuitiva com relatórios claros
- **Segurança**: Autenticação e auditoria implementadas

### 13.3. Atendimento aos Requisitos do PF

- ✅ Tabela USERS (USUARIO_SENHA) com MD5
- ✅ Tabela log_table (AUDITORIA_LOGIN)
- ✅ Tela de login implementada
- ✅ Tela de overview (dashboard) por tipo de usuário
- ✅ Tela de relatórios com múltiplos relatórios
- ✅ nRel ≥ (nUser × 2): 12+ relatórios para 4 tipos de usuários
- ✅ Todos os temas da disciplina cobertos
- ✅ Scripts SQL explícitos (sem ORMs que ocultam SQL)

O sistema está pronto para uso e demonstra proficiência nos conceitos de Bases de Dados estudados ao longo do semestre.

---

## Referências

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- PL/pgSQL Documentation: https://www.postgresql.org/docs/current/plpgsql.html
- SQL Window Functions: https://www.postgresql.org/docs/current/tutorial-window.html

---

**Arquivos Principais do Projeto:**

| Tema                                  | Arquivos Principais                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DDL**                               | [`upgrade_schema.sql`](server/sql/upgrade_schema.sql), [`downgrade_schema.sql`](server/sql/downgrade_schema.sql)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **DML**                               | [`functions/*.sql`](server/sql/functions/), [`queries/*.sql`](server/sql/queries/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Extended Group By (CUBE)**          | [`queries/reports/activities_cube.sql`](server/sql/queries/reports/activities_cube.sql)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Extended Group By (ROLLUP)**        | [`queries/reports/reservations_rollup.sql`](server/sql/queries/reports/reservations_rollup.sql)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Extended Group By (GROUPING SETS)** | [`queries/reports/participants_totals.sql`](server/sql/queries/reports/participants_totals.sql)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Window Functions**                  | 8 arquivos: [`installation_ranking.sql`](server/sql/queries/reports/installation_ranking.sql) (RANK), [`reservations_row_number.sql`](server/sql/queries/reports/reservations_row_number.sql) (ROW_NUMBER), [`activities_dense_rank.sql`](server/sql/queries/reports/activities_dense_rank.sql) (DENSE_RANK), [`reservations_monthly_growth.sql`](server/sql/queries/reports/reservations_monthly_growth.sql) (LAG), [`admin/upcoming_reservations.sql`](server/sql/queries/admin/upcoming_reservations.sql) (LEAD - Admin Dashboard), [`reservations_cumulative.sql`](server/sql/queries/reports/reservations_cumulative.sql) (SUM OVER), [`activities_moving_average.sql`](server/sql/queries/reports/activities_moving_average.sql) (AVG OVER), [`educator_activities_count.sql`](server/sql/queries/reports/educator_activities_count.sql) (COUNT OVER) |
| **PL/pgSQL**                          | [`functions/*.sql`](server/sql/functions/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Stored Procedures**                 | [`functions/*.sql`](server/sql/functions/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Triggers**                          | [`functions/common_triggers.sql`](server/sql/functions/common_triggers.sql)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Visões**                            | [`views.sql`](server/sql/views.sql) - 5 views implementadas; Queries em [`queries/views/*.sql`](server/sql/queries/views/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Índices Explícitos**                | [`indexes.sql`](server/sql/indexes.sql) - 25 índices explícitos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
