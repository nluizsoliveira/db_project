import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from app.database import DBSession

# Senha padrão para testes (será hasheada pelo PostgreSQL)
SENHA_PADRAO = "senha123"
# Emails fixos para login de testes
EMAILS_TESTE = ["admin@usp.br", "interno@usp.br", "funcionario@usp.br"]


def gerar_usuario_senha(dbsession):
    """
    Gera senhas para todos os internos USP (pessoas que podem fazer login).
    Usa a função hash_password() para gerar hashes MD5 (conforme especificação do PF).
    """
    # Verificar se a tabela USUARIO_SENHA existe
    table_check = dbsession.fetch_one("""
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = current_schema()
        AND lower(table_name) = lower('USUARIO_SENHA')
    """)

    if not table_check or table_check.get("count", 0) == 0:
        raise RuntimeError(
            "❌ Tabela USUARIO_SENHA não existe no banco de dados. "
            "Certifique-se de que o schema foi aplicado corretamente antes de popular os dados."
        )

    # Verificar se a função hash_password() existe
    function_check = dbsession.fetch_one("""
        SELECT COUNT(*) as count
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = current_schema()
        AND p.proname = 'hash_password'
    """)

    if not function_check or function_check.get("count", 0) == 0:
        raise RuntimeError(
            "❌ Função hash_password() não existe no banco de dados. "
            "Certifique-se de que as funções SQL (auth_functions.sql) foram aplicadas corretamente."
        )

    # Buscar todos os internos USP com seus emails
    internos_result = dbsession.fetch_all("""
        SELECT I.CPF_PESSOA, P.EMAIL
        FROM INTERNO_USP I
        JOIN PESSOA P ON I.CPF_PESSOA = P.CPF
    """)
    internos_dict = {row["cpf_pessoa"]: row["email"] for row in internos_result}
    cpfs_internos = list(internos_dict.keys())

    # Verificar se os usuários de teste existem e criar conjunto de CPFs de teste
    usuarios_teste_encontrados = []
    cpfs_usuarios_teste = set()
    for email_teste in EMAILS_TESTE:
        pessoa_teste_result = dbsession.fetch_one(f"""
            SELECT P.CPF
            FROM PESSOA P
            INNER JOIN INTERNO_USP I ON P.CPF = I.CPF_PESSOA
            WHERE P.EMAIL = '{email_teste}'
        """)
        if pessoa_teste_result:
            cpf_teste = pessoa_teste_result["cpf"]
            usuarios_teste_encontrados.append((email_teste, cpf_teste))
            cpfs_usuarios_teste.add(cpf_teste)
            print(f"   📧 Usuário de teste encontrado: {email_teste} (CPF: {cpf_teste})")

    if not cpfs_internos:
        print("⚠️  Nenhum interno USP encontrado. Pulando geração de senhas.")
        return

    usuarios_data = []

    # Data base para criação (últimos 6 meses)
    data_base = datetime.now() - timedelta(days=180)

    for cpf_pessoa in cpfs_internos:
        # Verificar se é usuário de teste
        eh_usuario_teste = cpf_pessoa in cpfs_usuarios_teste

        # Gerar data de criação aleatória nos últimos 6 meses
        dias_aleatorios = random.randint(2, 180)
        data_criacao = data_base + timedelta(days=dias_aleatorios)

        # 20% de chance de ter alteração de senha
        if random.random() < 0.2:
            dias_alteracao = random.randint(1, dias_aleatorios)
            data_ultima_alteracao = data_criacao + timedelta(days=dias_alteracao)
        else:
            data_ultima_alteracao = None

        # 5% de chance de estar bloqueado (mas usuários de teste NUNCA são bloqueados)
        if eh_usuario_teste:
            bloqueado = False
            tentativas_login = 0
        else:
            bloqueado = random.random() < 0.05
            # Tentativas de login (0-4, se bloqueado pode ter 5+)
            if bloqueado:
                tentativas_login = random.randint(5, 10)
            else:
                tentativas_login = random.randint(0, 3)

        # Data do último login (se não bloqueado e teve tentativas)
        if not bloqueado and tentativas_login > 0:
            dias_ultimo_login = random.randint(1, min(dias_aleatorios, 30))
            data_ultimo_login = data_criacao + timedelta(days=dias_ultimo_login)
        else:
            data_ultimo_login = None

        # Obter email da pessoa
        email_pessoa = internos_dict.get(cpf_pessoa, f"{cpf_pessoa}@usp.br")

        # Usar função PostgreSQL hash_password() para gerar o hash
        # A senha padrão será "senha123" para facilitar testes
        usuarios_data.append(
            (
                cpf_pessoa,  # CPF para buscar dados
                email_pessoa,  # Email para Login
                data_criacao,
                data_ultima_alteracao,
                bloqueado,
                tentativas_login,
                data_ultimo_login,
            )
        )

    if not usuarios_data:
        print("⚠️  Nenhum dado de usuário para inserir.")
        return

    print(f"Inserindo {len(usuarios_data)} usuários com senhas no banco...")
    print("   (Gerando hash da senha uma vez e reutilizando para otimizar...)")

    # Gerar o hash da senha uma vez (já que todos usam a mesma senha padrão)
    # Isso é muito mais rápido que gerar 4500 hashes individuais
    print("   Gerando hash da senha padrão...")
    # Usar cursor direto para passar tupla como parâmetro
    with dbsession.connection.cursor() as cursor:
        cursor.execute("SELECT hash_password(%s) as hash", (SENHA_PADRAO,))
        result = cursor.fetchone()
        senha_hash = result[0] if result else None

    if not senha_hash:
        raise RuntimeError("Falha ao gerar hash da senha")

    print("   ✅ Hash gerado com sucesso!")

    # Buscar tipos de usuário usando função get_user_type
    print("   Determinando tipos de usuário...")
    tipos_usuarios = {}
    with dbsession.connection.cursor() as cursor:
        for cpf in cpfs_internos:
            cursor.execute("SELECT get_user_type(%s) as tipo", (cpf,))
            result = cursor.fetchone()
            tipos_usuarios[cpf] = result[0] if result and result[0] else 'Interno'

    print("   ✅ Tipos determinados!")

    # Inserir usando hash pré-gerado (muito mais rápido)
    query = """
        INSERT INTO USUARIO_SENHA (
            USERID, LOGIN, SENHA, TIPO, IDORIGINAL,
            SENHA_HASH,
            DATA_CRIACAO, DATA_ULTIMA_ALTERACAO,
            BLOQUEADO, TENTATIVAS_LOGIN, DATA_ULTIMO_LOGIN
        )
        VALUES (
            %s, %s, %s, %s, %s,
            %s,
            %s, %s,
            %s, %s, %s
        )
    """

    # Preparar dados com hash pré-gerado e novos campos do PF
    dados_com_hash = [
        (
            cpf,  # USERID
            email,  # LOGIN
            senha_hash,  # SENHA
            tipos_usuarios.get(cpf, 'Interno'),  # TIPO
            cpf,  # IDORIGINAL
            senha_hash,  # SENHA_HASH (compatibilidade)
            data_criacao, data_alt,  # DATAS
            bloqueado, tentativas, data_login  # STATUS
        )
        for cpf, email, data_criacao, data_alt, bloqueado, tentativas, data_login in usuarios_data
    ]

    try:
        # Inserir em lotes para dar feedback de progresso
        BATCH_SIZE = 500  # Lotes maiores agora que não precisamos gerar hash para cada um
        total = len(dados_com_hash)
        inserted = 0

        for i in range(0, total, BATCH_SIZE):
            batch = dados_com_hash[i:i + BATCH_SIZE]
            dbsession.executemany(query, batch)
            inserted += len(batch)

            # Feedback de progresso
            percent = (inserted / total) * 100
            print(f"   Progresso: {inserted}/{total} ({percent:.1f}%)")

        print(f"✅ {len(usuarios_data)} usuários com senhas inseridos com sucesso!")
        print(f"   Senha padrão para testes: '{SENHA_PADRAO}'")
        print(f"   📧 Emails para login: {', '.join(EMAILS_TESTE)}")
    except Exception as e:
        error_msg = (
            f"❌ Erro ao inserir usuários com senhas: {e}\n"
            f"   Verifique se:\n"
            f"   - A tabela USUARIO_SENHA existe e está acessível\n"
            f"   - A função hash_password() está disponível\n"
            f"   - Os CPFs dos internos USP são válidos\n"
            f"   - Não há conflitos de chave primária (usuários já existentes)"
        )
        print(error_msg)
        raise RuntimeError(error_msg) from e


if __name__ == "__main__":
    dbsession = DBSession()
    try:
        gerar_usuario_senha(dbsession)
    finally:
        dbsession.close()
