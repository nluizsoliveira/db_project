# Responsabilidades e Permissões - Admin e Funcionário

Este documento descreve as responsabilidades e permissões dos perfis de **Administrador (Admin)** e **Funcionário (Staff)** no sistema CEFER.

## Índice

- [Visão Geral](#visão-geral)
- [Responsabilidades do Administrador](#responsabilidades-do-administrador)
- [Responsabilidades do Funcionário](#responsabilidades-do-funcionário)
- [Tabela Comparativa](#tabela-comparativa)
- [Hierarquia de Permissões](#hierarquia-de-permissões)
- [Detalhes Técnicos](#detalhes-técnicos)

---

## Visão Geral

### Diferença Fundamental

- **Funcionário (Staff)**: Qualquer pessoa que existe na tabela `FUNCIONARIO` do banco de dados. Pode ter várias atribuições (ex: "Professor de Educação Física", "Coordenador de Atividades Esportivas", etc.).

- **Administrador (Admin)**: É um `FUNCIONARIO` que possui a atribuição específica `'Administrador'` na tabela `FUNCIONARIO_ATRIBUICAO`. **Todo admin é um funcionário, mas nem todo funcionário é admin.**

### Verificação de Permissões

A verificação de roles é feita pela função SQL `get_user_roles()` que:

- Verifica se o usuário existe em `FUNCIONARIO` → role `staff`
- Verifica se o usuário tem atribuição `'Administrador'` em `FUNCIONARIO_ATRIBUICAO` → role `admin`

---

## Responsabilidades do Administrador

### 1. Gestão de Cadastros de Usuários

O administrador é o **único** responsável por aprovar ou rejeitar solicitações de cadastro de novos usuários no sistema.

#### Funcionalidades de Gestão de Cadastros

- **Aprovar solicitações de cadastro** (`/auth/approve-registration`)

  - Endpoint: `POST /auth/approve-registration`
  - Função SQL: `approve_registration(id_solicitacao, cpf_admin)`
  - Cria a conta do usuário com senha hasheada após aprovação

- **Rejeitar solicitações de cadastro** (`/auth/reject-registration`)

  - Endpoint: `POST /auth/reject-registration`
  - Função SQL: `reject_registration(id_solicitacao, cpf_admin, observacoes)`
  - Permite adicionar observações sobre o motivo da rejeição

- **Visualizar solicitações pendentes** (`/auth/pending-registrations`)
  - Endpoint: `GET /auth/pending-registrations`
  - Lista todas as solicitações com status `PENDENTE`
  - Interface: `/auth/pending-registrations`

#### Verificação de Acesso

```python
if not profile_access.get("admin"):
    return jsonify({"success": False, "message": "Acesso de administrador necessário"}), 403
```

### 2. Dashboard Administrativo

Acesso exclusivo ao painel de controle administrativo com visão geral do sistema.

#### Funcionalidades do Dashboard Administrativo

- **Acessar dashboard administrativo** (`/admin/dashboard`)

  - Endpoint: `GET /admin/dashboard`
  - Proteção: `@require_role("admin")`
  - Interface: `/admin/dashboard`

- **Estatísticas gerais do sistema**

  - Total de pessoas registradas
  - Total de membros internos USP
  - Total de reservas agendadas
  - Total de atividades registradas
  - Query: `queries/admin/dashboard_stats.sql`

- **Próximas reservas**

  - Visualiza as próximas 8 reservas agendadas
  - Mostra instalação, data, horário e responsável
  - Query: `queries/admin/upcoming_reservations.sql`

- **Matrículas em atividades**

  - Top 8 atividades por taxa de ocupação
  - Mostra vagas ocupadas vs. vagas limite
  - Calcula percentual de ocupação
  - Query: `queries/admin/activity_enrollment.sql`

### 3. Gestão de Grupos de Extensão

Gerenciamento completo (CRUD) dos grupos de extensão do sistema.

#### Funcionalidades de Gestão de Grupos

- **Criar grupo de extensão** (`/extension_group/create`)

  - Endpoint: `POST /extension_group/create`
  - Proteção: `@require_role("admin")`
  - Parâmetros: nome, descrição, CPF do responsável
  - Query: `queries/extension_group/criar_grupo_extensao.sql`

- **Atualizar grupo de extensão** (`/extension_group/update`)

  - Endpoint: `POST /extension_group/update`
  - Proteção: `@require_role("admin")`
  - Permite alterar nome, descrição e responsável
  - Query: `queries/extension_group/atualizar_grupo_extensao.sql`

- **Deletar grupo de extensão** (`/extension_group/delete`)

  - Endpoint: `DELETE /extension_group/delete`
  - Proteção: `@require_role("admin")`
  - Query: `queries/extension_group/deletar_grupo_extensao.sql`

- **Dashboard de grupos de extensão** (`/extension_group/`)
  - Endpoint: `GET /extension_group/`
  - Proteção: `@require_role("admin")`
  - Visualiza estatísticas e grupos existentes

### 4. Interface do Usuário (Admin)

- **Link "Administração" na navbar**
  - Visível apenas para usuários com role `admin`
  - Redireciona para `/admin/dashboard`
  - Código: `showAdmin: hasRole(user, 'admin')`

---

## Responsabilidades do Funcionário

### 1. Dashboard de Equipe

Acesso ao painel de controle da equipe para gerenciar atividades do dia a dia.

#### Funcionalidades do Dashboard de Equipe

- **Acessar dashboard de equipe** (`/staff/dashboard`)

  - Endpoint: `GET /staff/dashboard`
  - Proteção: `@require_role("staff", "admin")`
  - Interface: `/staff/dashboard`

- **Visualizar atividades com filtros**

  - Filtro por dia da semana (`weekday`)
  - Filtro por grupo de extensão (`group_name`)
  - Filtro por modalidade (`modality`)
  - Query: `queries/staff/activities.sql`
  - Função SQL: `listar_atividades(weekday, group_name, modality)`

- **Informações exibidas**

  - ID da atividade
  - Nome da atividade
  - Grupo de extensão
  - Dia da semana
  - Horário de início e fim
  - Vagas ocupadas vs. vagas limite

### 2. Relatórios

Acesso a relatórios e análises do sistema.

#### Funcionalidades de Relatórios

- **Acessar relatórios** (`/reports/overview`)

  - Endpoint: `GET /reports/overview`
  - Proteção: `@require_auth` (disponível para admin, staff e internal)
  - Interface: `/reports/overview`

- **Relatórios disponíveis**

  - **Rollup de reservas** (`queries/reports/reservations_rollup.sql`)

    - Agregação de dados de reservas

  - **Cubo de atividades** (`queries/reports/activities_cube.sql`)

    - Análise multidimensional de atividades

  - **Totais de participantes** (`queries/reports/participants_totals.sql`)

    - Contagem de participantes por categoria

  - **Ranking de instalações** (`queries/reports/installation_ranking.sql`)

    - Classificação de instalações por uso

  - **Ocorrências de atividades** (`queries/reports/activity_occurrences.sql`)

    - Frequência e distribuição de atividades

  - **Instalações mais reservadas** (`queries/reports/installations_most_reserved.sql`)
    - Top instalações por número de reservas

### 3. Funcionalidades de Interno (Herdadas)

Como funcionário é também um interno USP, tem acesso a todas as funcionalidades de usuário interno.

#### Funcionalidades de Interno para Funcionário

- **Acessar dashboard interno** (`/internal/dashboard`)

  - Endpoint: `GET /internal/dashboard`
  - Proteção: `@require_role("internal", "staff", "admin")`
  - Interface: `/internal/dashboard`

- **Ver reservas por CPF de interno**

  - Filtro por CPF
  - Query: `queries/internal/reservas_por_interno.sql`
  - Lista todas as reservas de um interno específico

- **Ver instalações disponíveis**

  - Filtros: data, horário de início, horário de fim
  - Query: `queries/internal/instalacoes_disponiveis.sql`
  - Mostra instalações livres no período especificado

### 4. Interface do Usuário

- **Link "Equipe" na navbar**

  - Visível para usuários com role `staff` ou `admin`
  - Redireciona para `/staff/dashboard`
  - Código: `showStaff: hasRole(user, 'staff') || hasRole(user, 'admin')`

- **Link "Relatórios" na navbar**
  - Visível para admin, staff e internal
  - Redireciona para `/reports/overview`
  - Código: `showReports: hasRole(user, 'admin') || hasRole(user, 'staff') || hasRole(user, 'internal')`

### 4. Interface do Usuário (Funcionário)

- **Link "Equipe" na navbar**

  - Visível para usuários com role `staff` ou `admin`
  - Redireciona para `/staff/dashboard`
  - Código: `showStaff: hasRole(user, 'staff') || hasRole(user, 'admin')`

- **Link "Relatórios" na navbar**
  - Visível para admin, staff e internal
  - Redireciona para `/reports/overview`
  - Código: `showReports: hasRole(user, 'admin') || hasRole(user, 'staff') || hasRole(user, 'internal')`

---

## Tabela Comparativa

| Funcionalidade                                        | Admin | Funcionário (Staff) |
| ----------------------------------------------------- | ----- | ------------------- |
| **Gestão de Cadastros**                               |       |                     |
| Aprovar/rejeitar cadastros de novos usuários          | ✅    | ❌                  |
| Visualizar solicitações pendentes                     | ✅    | ❌                  |
| **Dashboard Administrativo**                          |       |                     |
| Acessar dashboard administrativo (`/admin/dashboard`) | ✅    | ❌                  |
| Ver estatísticas gerais do sistema                    | ✅    | ❌                  |
| Ver próximas reservas                                 | ✅    | ❌                  |
| Ver matrículas em atividades com taxa de ocupação     | ✅    | ❌                  |
| **Gestão de Grupos de Extensão**                      |       |                     |
| Criar grupos de extensão                              | ✅    | ❌                  |
| Atualizar grupos de extensão                          | ✅    | ❌                  |
| Deletar grupos de extensão                            | ✅    | ❌                  |
| Acessar dashboard de grupos de extensão               | ✅    | ❌                  |
| **Dashboard de Equipe**                               |       |                     |
| Acessar dashboard de equipe (`/staff/dashboard`)      | ✅    | ✅                  |
| Ver atividades com filtros (dia, grupo, modalidade)   | ✅    | ✅                  |
| **Relatórios**                                        |       |                     |
| Acessar relatórios (`/reports/overview`)              | ✅    | ✅                  |
| Ver rollup de reservas                                | ✅    | ✅                  |
| Ver cubo de atividades                                | ✅    | ✅                  |
| Ver totais de participantes                           | ✅    | ✅                  |
| Ver ranking de instalações                            | ✅    | ✅                  |
| Ver ocorrências de atividades                         | ✅    | ✅                  |
| Ver instalações mais reservadas                       | ✅    | ✅                  |
| **Funcionalidades de Interno**                        |       |                     |
| Acessar dashboard interno (`/internal/dashboard`)     | ✅    | ✅                  |
| Ver reservas por CPF de interno                       | ✅    | ✅                  |
| Ver instalações disponíveis com filtros               | ✅    | ✅                  |
| **Outros**                                            |       |                     |
| Alterar senha                                         | ✅    | ✅                  |
| Link "Administração" na navbar                        | ✅    | ❌                  |
| Link "Equipe" na navbar                               | ✅    | ✅                  |
| Link "Relatórios" na navbar                           | ✅    | ✅                  |

---

## Hierarquia de Permissões

O sistema segue uma hierarquia de permissões onde cada nível herda as permissões dos níveis inferiores:

```text
Admin (Máximo)
  ├── Todas as permissões de Staff
  ├── Todas as permissões de Internal
  └── Permissões exclusivas administrativas

Staff (Funcionário)
  ├── Todas as permissões de Internal
  └── Permissões de equipe e relatórios

Internal (Interno USP)
  └── Permissões básicas de usuário interno

External (Externo)
  └── Permissões limitadas de convidado
```

### Regras de Herança

1. **Admin herda tudo**: Um administrador tem acesso a todas as funcionalidades de staff, internal e external.

2. **Staff herda de Internal**: Um funcionário tem acesso a todas as funcionalidades de um interno USP, além das funcionalidades específicas de staff.

3. **Verificação em cascata**: As rotas que permitem múltiplos roles usam o decorator `@require_role("internal", "staff", "admin")`, permitindo acesso a qualquer um desses níveis.

---

## Detalhes Técnicos

### Verificação de Roles no Backend

#### Função SQL: `get_user_roles(cpf_pessoa)`

Localização: `server/sql/functions/auth_functions.sql`

```sql
-- Verifica se é admin (tem 'Administrador' em FUNCIONARIO_ATRIBUICAO)
SELECT EXISTS(
    SELECT 1
    FROM funcionario_atribuicao fa
    JOIN funcionario f ON fa.cpf_funcionario = f.cpf_interno
    WHERE f.cpf_interno = cpf_pessoa
    AND fa.atribuicao LIKE '%Administrador%'
) INTO is_admin;

-- Verifica se é staff (existe em FUNCIONARIO)
SELECT EXISTS(
    SELECT 1
    FROM funcionario
    WHERE cpf_interno = cpf_pessoa
) INTO is_staff;
```

#### Decorator Python: `@require_role()`

Localização: `server/app/services/auth/decorators.py`

```python
def require_role(*allowed_roles):
    """Decorator para exigir roles específicos."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if session.get("user_id"):
                profile_access = session.get("profile_access", {})
                has_role = any(profile_access.get(role) for role in allowed_roles)

                if not has_role:
                    return jsonify({"success": False, "message": "Permissões insuficientes"}), 403

                return f(*args, **kwargs)
        return decorated_function
    return decorator
```

### Verificação de Roles no Frontend

#### Função: `hasRole(user, role)`

Localização: `client/lib/auth.ts`

```typescript
export function hasRole(
  user: User | null,
  role: "admin" | "staff" | "internal" | "external"
): boolean {
  if (!user) return false;
  return user.roles[role] === true;
}
```

#### Componente: `NavbarLinks`

Localização: `client/components/NavbarLinks.tsx`

```typescript
const visibility = useMemo(
  () => ({
    showAdmin: hasRole(user, "admin"),
    showStaff: hasRole(user, "staff") || hasRole(user, "admin"),
    showInternal:
      hasRole(user, "internal") ||
      hasRole(user, "staff") ||
      hasRole(user, "admin"),
    showReports:
      hasRole(user, "admin") ||
      hasRole(user, "staff") ||
      hasRole(user, "internal"),
  }),
  [user]
);
```

### Rotas Protegidas

#### Rotas Exclusivas de Admin

- `GET /admin/dashboard` → `@require_role("admin")`
- `GET /auth/pending-registrations` → Verificação manual: `profile_access.get("admin")`
- `POST /auth/approve-registration` → Verificação manual: `profile_access.get("admin")`
- `POST /auth/reject-registration` → Verificação manual: `profile_access.get("admin")`
- `GET /extension_group/` → `@require_role("admin")`
- `POST /extension_group/create` → `@require_role("admin")`
- `POST /extension_group/update` → `@require_role("admin")`
- `DELETE /extension_group/delete` → `@require_role("admin")`

#### Rotas Compartilhadas (Staff e Admin)

- `GET /staff/dashboard` → `@require_role("staff", "admin")`
- `GET /reports/overview` → `@require_auth` (admin, staff, internal)
- `GET /internal/dashboard` → `@require_role("internal", "staff", "admin")`

### Estrutura do Banco de Dados

#### Tabela: `FUNCIONARIO`

```sql
CREATE TABLE FUNCIONARIO (
    CPF_INTERNO VARCHAR(11) NOT NULL,
    FORMACAO VARCHAR(100),
    CONSTRAINT PK_FUNCIONARIO PRIMARY KEY (CPF_INTERNO),
    CONSTRAINT FK_FUNCIONARIO_INTERNO FOREIGN KEY (CPF_INTERNO)
        REFERENCES INTERNO_USP (CPF_PESSOA)
);
```

#### Tabela: `FUNCIONARIO_ATRIBUICAO`

```sql
CREATE TABLE FUNCIONARIO_ATRIBUICAO (
    CPF_FUNCIONARIO VARCHAR(11) NOT NULL,
    ATRIBUICAO VARCHAR(255) NOT NULL,
    CONSTRAINT PK_FUNCIONARIO_ATRIBUICAO PRIMARY KEY (CPF_FUNCIONARIO, ATRIBUICAO),
    CONSTRAINT FK_ATRIBUICAO_FUNCIONARIO FOREIGN KEY (CPF_FUNCIONARIO)
        REFERENCES FUNCIONARIO (CPF_INTERNO)
);
```

**Nota**: Um funcionário se torna admin quando possui uma linha em `FUNCIONARIO_ATRIBUICAO` com `ATRIBUICAO = 'Administrador'`.

### Fluxo de Autenticação

1. **Login**: Usuário faz login com email/CPF e senha
2. **Autenticação**: Função SQL `authenticate_user()` valida credenciais
3. **Obtenção de Roles**: Função SQL `get_user_roles()` determina os roles do usuário
4. **Armazenamento na Sessão**: Roles são armazenados em `session["profile_access"]`
5. **Verificação de Acesso**: Decorators e verificações manuais checam `profile_access` antes de permitir acesso

---

## Resumo

### Administrador (Admin)

- **Responsabilidade Principal**: Gerenciar o sistema (cadastros, grupos, estatísticas)
- **Permissões Exclusivas**

  - Aprovar/rejeitar cadastros
  - Acessar dashboard administrativo
  - Gerenciar grupos de extensão
  - Ver estatísticas gerais do sistema

- **Herda**: Todas as permissões de staff, internal e external

### Funcionário (Staff)

- **Responsabilidade Principal**: Operar funcionalidades do dia a dia (atividades, relatórios, reservas)
- **Permissões Exclusivas**

  - Acessar dashboard de equipe
  - Ver atividades com filtros

- **Herda**: Todas as permissões de internal
- **Compartilha com Admin**

  - Acesso a relatórios
  - Acesso a dashboard interno
  - Visualização de atividades

### Diferença Chave

A diferença principal está na **gestão administrativa**: apenas o ADMIN pode aprovar cadastros, gerenciar grupos de extensão e acessar o dashboard administrativo com estatísticas gerais do sistema. O FUNCIONÁRIO foca nas operações do dia a dia relacionadas a atividades, relatórios e reservas.
