# db_project

Sistema de gerenciamento de reservas e atividades para instalações esportivas.

## 📋 Sobre o Projeto

Aplicação full-stack desenvolvida com:
- **Backend**: Flask (Python) - API REST
- **Frontend**: Next.js 16 (React 19 + TypeScript)
- **Banco de Dados**: PostgreSQL 17
- **Orquestração**: Docker Compose

## 🏗️ Estrutura do Projeto

```
db_project/
├── client/          # Frontend Next.js
├── server/          # Backend Flask
│   ├── app/         # Aplicação Flask (rotas, serviços)
│   ├── data_generators/  # Geradores de dados sintéticos
│   ├── sql/         # Scripts SQL (migrações, views, funções)
│   └── tests/       # Testes automatizados
├── docs/            # Documentação do projeto
└── docker-compose.yml
```

## 📦 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ e pnpm (para desenvolvimento local do frontend)
- Python 3.12+ (para desenvolvimento local do backend)

## 🚀 Como Rodar

### Método 1: Docker Compose (Recomendado)

Este método sobe toda a aplicação (PostgreSQL, Flask e Next.js) em containers Docker.

#### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=public
POSTGRES_PORT=5432

# Database Connection (Flask)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=public
DB_USER=postgres
DB_PASSWORD=postgres

# Flask
FLASK_SECRET_KEY=your-secret-key-here
FLASK_DEBUG=true
FLASK_RUN_PORT=5050
FLASK_RUN_HOST=0.0.0.0
FLASK_PORT=5050

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:5050
NODE_ENV=development
NEXTJS_PORT=3000

# População automática do banco (opcional)
POPULATE_DB=true
```

#### 2. Subir os serviços

```bash
docker compose up -d
```

Isso irá:
- Iniciar o PostgreSQL 17
- Construir e iniciar a aplicação Flask
- Construir e iniciar a aplicação Next.js
- Popular o banco de dados automaticamente (se `POPULATE_DB=true`)

#### 3. Acessar as aplicações

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050
- **PostgreSQL**: localhost:5432

#### 4. Ver logs

```bash
# Todos os serviços
docker compose logs -f

# Apenas um serviço
docker compose logs -f flask_app
docker compose logs -f nextjs_app
docker compose logs -f postgres
```

#### 5. Parar os serviços

```bash
docker compose down
```

### Método 2: Desenvolvimento Local

#### Backend (Flask)

1. **Instalar dependências Python**

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configurar variáveis de ambiente**

Certifique-se de que o arquivo `.env` está configurado corretamente (veja Método 1).

3. **Rodar o servidor Flask**

```bash
# Com o PostgreSQL rodando (via Docker Compose ou localmente)
flask run --host=0.0.0.0 --port=5050 --reload
```

#### Frontend (Next.js)

1. **Instalar dependências**

```bash
cd client
pnpm install
```

2. **Rodar o servidor de desenvolvimento**

```bash
pnpm dev
```

O frontend estará disponível em http://localhost:3000

## 🗄️ Banco de Dados

### Popular o banco de dados

#### Opção 1: Automática (Docker)

Se `POPULATE_DB=true` no `.env`, o banco será populado automaticamente ao iniciar o container Flask.

#### Opção 2: Manual

```bash
# Dentro do container ou ambiente Python ativado
cd server
./scripts/populate_db.sh
```

Este script:
- Aplica as migrações de schema
- Popula todas as tabelas com dados sintéticos

### Reverter/limpar o banco

```bash
cd server
./scripts/downgrade_db.sh
```

Isso executará os scripts de downgrade na ordem inversa, limpando todas as tabelas e o schema.

### Acessar o PostgreSQL via psql

```bash
# Via Docker
docker exec -it postgres17 bash
su postgres
psql

# Ou diretamente
docker exec -it postgres17 psql -U postgres -d public
```

## 🧪 Testes

### Rodar testes do backend

```bash
cd server
source venv/bin/activate
pytest -s
```

### Rodar testes específicos

```bash
pytest tests/test_schema_migration.py -s
pytest tests/test_populate_minimal_db_migration.py -s
```

## 👤 Logins de Teste

Consulte o arquivo `LOGINS.md` para informações sobre usuários de teste e senhas padrão.

**Resumo rápido:**
- **Senha padrão**: `senha123` (para todos os usuários internos)
- **Admin**: `admin@usp.br` / `senha123`
- **Funcionário**: `funcionario@usp.br` / `senha123`
- **Interno**: `interno@usp.br` / `senha123`

## 📝 Scripts Úteis

### Backend

- `./scripts/populate_db.sh` - Popula o banco de dados
- `./scripts/downgrade_db.sh` - Reverte/limpa o banco de dados

### Frontend

- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm start` - Inicia servidor de produção
- `pnpm lint` - Executa o linter

## 🔧 Desenvolvimento

### Estrutura do Backend

- `app/routes/` - Rotas da API REST
- `app/services/` - Lógica de negócio
- `app/database.py` - Configuração do banco de dados
- `sql/upgrade_schema.sql` - Schema principal
- `sql/downgrades/` - Scripts de downgrade
- `sql/functions/` - Funções SQL
- `sql/views.sql` - Views do banco

### Estrutura do Frontend

- `app/` - Rotas e páginas (App Router do Next.js)
- `components/` - Componentes React
- `hooks/` - Custom hooks
- `lib/` - Utilitários e configurações

## 🐛 Troubleshooting

### Erro de conexão com o banco

- Verifique se o PostgreSQL está rodando: `docker compose ps`
- Verifique as variáveis de ambiente no `.env`
- Verifique os logs: `docker compose logs postgres`

### Erro ao popular o banco

- Verifique se o PostgreSQL está saudável: `docker compose ps`
- Verifique os logs do Flask: `docker compose logs flask_app`
- Tente popular manualmente: `./scripts/populate_db.sh`

### Porta já em uso

- Altere as portas no arquivo `.env` (ex: `FLASK_PORT=5051`, `NEXTJS_PORT=3001`)
- Ou pare o processo que está usando a porta

## 📚 Documentação Adicional

- `LOGINS.md` - Informações sobre logins de teste
- `RESPONSABILIDADES.md` - Responsabilidades do projeto
- `docs/` - Documentação técnica e entregas

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Teste localmente
4. Envie um pull request

## 📄 Licença

Este projeto é parte de um trabalho acadêmico.
