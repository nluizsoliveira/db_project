import random
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from app.database import DBSession

# Função para gerar um NUSP aleatório (5 a 8 dígitos) que não existe no banco
def gerar_nusp(dbsession, max_tentativas=100):
    """
    Gera um NUSP único verificando se já existe no banco.

    Args:
        dbsession: Instância de DBSession para consultar o banco
        max_tentativas: Número máximo de tentativas para gerar um NUSP único

    Returns:
        str: NUSP único
    """
    for _ in range(max_tentativas):
        nusp = f"{random.randint(10000, 99999999)}"
        # Verificar se o NUSP já existe
        existe = dbsession.fetch_one(
            "SELECT 1 FROM INTERNO_USP WHERE NUSP = %s",
            (nusp,)
        )
        if not existe:
            return nusp
    # Se não conseguiu gerar um único após max_tentativas, usar timestamp + random
    return f"{int(time.time()) % 100000000}{random.randint(1000, 9999)}"

# Função para dividir os dados em 90% para internos e 10% para pessoas restantes
def gerar_interno_usp(dbsession):
    # Emails fixos para garantir que sejam internos
    EMAILS_TESTE = ["admin@usp.br", "interno@usp.br", "funcionario@usp.br", "cadastro@usp.br"]

    # NUSPs fixos para emails de teste (para garantir consistência e facilitar testes)
    NUSPS_TESTE = {
        "admin@usp.br": "12345678",
        "interno@usp.br": "12345679",
        "funcionario@usp.br": "12345680",
        "cadastro@usp.br": "12345681"  # NUSP fixo para teste de cadastro
    }

    # Buscar todas as pessoas do banco
    pessoas_result = dbsession.fetch_all("SELECT CPF, EMAIL FROM PESSOA ORDER BY CPF")
    cpfs = [row['cpf'] for row in pessoas_result]

    # Garantir que as pessoas com emails fixos sejam internas
    cpfs_teste = []
    email_para_cpf = {}  # Mapear email para CPF para usar NUSP fixo depois
    for email_teste in EMAILS_TESTE:
        pessoa_teste_result = dbsession.fetch_one(f"SELECT CPF FROM PESSOA WHERE EMAIL = '{email_teste}'")
        if pessoa_teste_result:
            cpf_teste = pessoa_teste_result['cpf']
            if cpf_teste in cpfs:
                cpfs.remove(cpf_teste)
                cpfs_teste.append(cpf_teste)
                email_para_cpf[cpf_teste] = email_teste

    # Embaralhar os dados para garantir a aleatoriedade
    random.shuffle(cpfs)

    # Calcular a quantidade para 90% e 10%
    total_pessoas = len(cpfs) + len(cpfs_teste)
    percentual_90 = int(total_pessoas * 0.9)

    # Ajustar para garantir que os testes sejam incluídos
    if cpfs_teste:
        percentual_90 = max(percentual_90, len(cpfs_teste))

    # Separar os dados (garantir que testes estão nos internos)
    cpfs_internos = cpfs[:percentual_90 - len(cpfs_teste)]
    # Inserir os CPFs de teste no início para garantir
    cpfs_internos = cpfs_teste + cpfs_internos

    # Verificar quais CPFs já têm internos cadastrados
    cpfs_existentes = set()
    if cpfs_internos:
        cpfs_str = "', '".join(cpfs_internos)
        existentes_result = dbsession.fetch_all(
            f"SELECT CPF_PESSOA FROM INTERNO_USP WHERE CPF_PESSOA IN ('{cpfs_str}')"
        )
        cpfs_existentes = {row['cpf_pessoa'] for row in existentes_result}

    # Preparar dados para inserção no banco (apenas para CPFs que não têm interno ainda)
    internos_data = []
    nusps_gerados = set()  # Para evitar duplicatas no mesmo batch

    for cpf_pessoa in cpfs_internos:
        if cpf_pessoa not in cpfs_existentes:
            # Verificar se é email de teste para usar NUSP fixo
            email_pessoa = email_para_cpf.get(cpf_pessoa)
            if email_pessoa and email_pessoa in NUSPS_TESTE:
                # Usar NUSP fixo para emails de teste
                nusp = NUSPS_TESTE[email_pessoa]
                # Verificar se o NUSP fixo já existe (pode existir de execução anterior)
                nusp_existe = dbsession.fetch_one(
                    "SELECT 1 FROM INTERNO_USP WHERE NUSP = %s AND CPF_PESSOA != %s",
                    (nusp, cpf_pessoa)
                )
                if nusp_existe:
                    # Se o NUSP fixo já está em uso por outro CPF, gerar um novo
                    print(f"   ⚠️  NUSP fixo {nusp} já está em uso. Gerando novo NUSP para {email_pessoa}")
                    nusp = gerar_nusp(dbsession)
                    tentativas = 0
                    while nusp in nusps_gerados:
                        nusp = gerar_nusp(dbsession)
                        tentativas += 1
                        if tentativas > 100:
                            nusp = f"{int(time.time() * 1000) % 100000000}{random.randint(1000, 9999)}"
                            break
                else:
                    print(f"   📧 Usando NUSP fixo {nusp} para {email_pessoa}")
            else:
                # Gerar NUSP único para usuários normais (não existe no banco nem no batch atual)
                nusp = gerar_nusp(dbsession)
                tentativas = 0
                while nusp in nusps_gerados:  # gerar_nusp já verifica no banco
                    nusp = gerar_nusp(dbsession)
                    tentativas += 1
                    if tentativas > 100:
                        # Fallback: usar timestamp + random para garantir unicidade
                        nusp = f"{int(time.time() * 1000) % 100000000}{random.randint(1000, 9999)}"
                        break

            nusps_gerados.add(nusp)
            internos_data.append((cpf_pessoa, nusp))

    if not internos_data:
        print("⚠️  Todos os CPFs já possuem internos cadastrados. Nada a inserir.")
        return

    # Inserir diretamente no banco com ON CONFLICT para evitar duplicatas
    # NUSP já é verificado antes de inserir, então só precisamos verificar CPF
    query = """
        INSERT INTO INTERNO_USP (CPF_PESSOA, NUSP)
        VALUES (%s, %s)
        ON CONFLICT (CPF_PESSOA) DO NOTHING
    """

    print(f"Inserindo {len(internos_data)} internos no banco...")
    dbsession.executemany(query, internos_data)
    print(f"✅ {len(internos_data)} internos inseridos com sucesso!")

if __name__ == "__main__":
    dbsession = DBSession()
    try:
        gerar_interno_usp(dbsession)
    finally:
        dbsession.close()
