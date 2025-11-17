# db_project

Ambiente de desenvolvimento: WSL Ubuntu.

## Rotas e navegação

Os blueprints permanecem isolados, mas a navegação foi simplificada para um topo único. Cada item usa o helper `build_url`, então endpoints ausentes geram apenas um aviso no log sem quebrar a página.

- `admin`: painel operacional (`/admin`)
- `reports`: relatórios consolidados (`/reports`)
- `staff`: filtros de atividades para equipes internas (`/staff`)
- `internal`: portal USP com consultas de reservas (`/internal`)
- `external`: monitor de convites externos (`/external`)

Todos os templates recebem dados exclusivamente das consultas em `sql/queries` ou `sql/funcionalidades`. Não existe regra de negócio em Python: cada rota só carrega o arquivo SQL correspondente e repassa o resultado ao template.

### Mapa de queries

| Área/Endpoint                | Fonte SQL                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `admin.dashboard`            | `sql/queries/admin/dashboard_stats.sql`, `.../upcoming_reservations.sql`, `.../activity_enrollment.sql` |
| `reports.overview`           | Arquivos em `sql/queries/reports/` (rollup, cube, grouping sets, ranking)                               |
| `staff.dashboard`            | `sql/queries/staff/activities.sql` (invoca `listar_atividades`)                                         |
| `internal.dashboard`         | `sql/queries/internal/reservas_por_interno.sql`, `.../instalacoes_disponiveis.sql`                      |
| `external.dashboard`         | `sql/queries/external/external_participations.sql`                                                      |
| `auth.login`                 | `sql/queries/auth/login_user.sql` (invoca `authenticate_user`)                                          |
| `auth.register`              | `sql/queries/auth/request_registration.sql` (invoca `request_registration`)                             |
| `auth.pending_registrations` | `sql/queries/auth/list_pending_registrations.sql`                                                       |

Para criar uma nova página, adicione primeiro o arquivo SQL em `sql/queries/<area>/` e aponte a rota correspondente via `app/services/sql_queries.py`.

## Autenticação

O sistema implementa autenticação completa com todas as regras de negócio em SQL. A lógica de autenticação está implementada em funções PL/pgSQL em `sql/funcionalidades/auth_functions.sql`.

### Funções de Autenticação

- `hash_password(plain_password TEXT)`: Gera hash bcrypt para senhas
- `verify_password(plain_password TEXT, hashed_password TEXT)`: Verifica se senha corresponde ao hash
- `authenticate_user(email_or_cpf VARCHAR, plain_password TEXT, ip_origin VARCHAR)`: Autentica usuário e retorna roles
- `get_user_roles(cpf_pessoa VARCHAR)`: Retorna array de roles do usuário (admin, staff, internal, external)
- `request_registration(cpf_pessoa VARCHAR, nusp VARCHAR, email VARCHAR, plain_password TEXT)`: Cria solicitação de cadastro
- `approve_registration(id_solicitacao INT, cpf_admin VARCHAR)`: Aprova solicitação e cria conta
- `reject_registration(id_solicitacao INT, cpf_admin VARCHAR, observacoes TEXT)`: Rejeita solicitação

### Roles e Permissões

Os roles são determinados automaticamente baseado nas relações no banco:

- **admin**: Usuário com atribuição contendo 'Administrador' em `FUNCIONARIO_ATRIBUICAO`
- **staff**: Usuário existente em `FUNCIONARIO` (funcionário CEFER)
- **internal**: Usuário existente em `INTERNO_USP`
- **external**: Usuário em `PESSOA` que não está em `INTERNO_USP` e tem registro em `CONVITE_EXTERNO`

### Fluxo de Cadastro

1. Interno USP acessa `/auth/register` e preenche CPF, NUSP, email e senha
2. Sistema valida que CPF existe em `INTERNO_USP` com NUSP correspondente
3. Cria registro em `SOLICITACAO_CADASTRO` com status 'PENDENTE'
4. Admin acessa `/auth/pending-registrations` para aprovar/rejeitar
5. Ao aprovar, sistema cria conta em `USUARIO_SENHA` com senha hasheada

### Usuário de Teste

O sistema inclui um usuário de teste para desenvolvimento:

- **Email**: `teste@usp.br`
- **Senha**: `teste123`
- **CPF**: `12345678901`
- **NUSP**: `1234567890`
- **Role**: Admin (com atribuição 'Administrador CEFER')

Este usuário é criado automaticamente ao executar `populate_db.py`.

## Como rodar

### 1. Instalar o Docker

Baixe e instale o Docker no seu sistema:

- [Docker Desktop para Windows/macOS](https://www.docker.com/products/docker-desktop)
- [Docker Engine para Linux](https://docs.docker.com/engine/install/)

Verifique a instalação:

```bash
docker --version
docker compose version
```

### 2. Baixar imagem do Postgres 17

```bash
docker pull postgres:17
```

### 3. Subir DB

Na pasta do repositório clonado

```bash
docker compose up -d
```

O serviço Flask ficará acessível em `http://127.0.0.1:5050/` (porta configurada no Docker).

### (Opcional) Acessar psql

```bash
docker exec -it postgres17 bash
su postgres
psql
```

### 4. Instalar dependências do Python

```
sudo apt install python3.12-venv
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

### 5. Rodar testes

```
pytest -s
```

### 6. Executar o aplicativo Flask

Crie as variáveis de ambiente, se necessário, e execute:

```
export FLASK_APP=wsgi.py
export FLASK_ENV=development
flask run --port 5050
```

O servidor local (fora dos contêineres) e o contêiner expõem a aplicação em `http://127.0.0.1:5050/`.

### 7. Popular o banco de dados com dados fictícios (carga completa)

1. **Gerar os arquivos SQL de carga**
   Acesse a pasta `dados_ficticios` e execute o script responsável por gerar os arquivos `.sql`:

   ```bash
   cd dados_ficticios
   python gerar_dados.py
   ```

   Esse script executa todos os geradores e move automaticamente os arquivos SQL criados para a pasta:

   ```
   sql/populate_mocked_full_db/
   ```

---

2. **Popular o banco de dados**
   Retorne à pasta principal do projeto e execute:

   ```bash
   python populate_db.py
   ```

   Esse comando aplicará as migrações de _schema_ e preencherá todas as tabelas do banco com os dados fictícios gerados.

---

3. **(Opcional) Reverter ou limpar o banco de dados**
   Caso queira desfazer a carga e remover os dados populados:

   ```bash
   python downgrade_db.py
   ```

   Isso executará os scripts de _downgrade_ na ordem inversa, limpando todas as tabelas e o schema.

---
