from faker import Faker
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from app.database import DBSession


# Função para gerar CPF válido
def gerar_cpf():
    def calcular_dv(cpf_base):
        cpf_base = [int(d) for d in cpf_base]
        for i in range(2):
            peso = list(range(10 - i, 1, -1)) if i == 0 else list(range(11 - i, 1, -1))
            soma = sum([cpf_base[j] * peso[j] for j in range(len(peso))])
            resto = soma % 11
            digito = 0 if resto < 2 else 11 - resto
            cpf_base.append(digito)
        return "".join(map(str, cpf_base))

    while True:
        cpf_base = [str(random.randint(0, 9)) for _ in range(9)]
        cpf = calcular_dv(cpf_base)
        if cpf[0] != "0":  # opcional, evitar CPF começando com 0
            return cpf


# Inicializa Faker
fake = Faker("pt_BR")

# Emails fixos para login de testes
EMAIL_ADMIN = "admin@usp.br"
EMAIL_INTERNO = "interno@usp.br"
EMAIL_FUNCIONARIO = "funcionario@usp.br"
EMAIL_TESTE_CADASTRO = "cadastro@usp.br"


def gerar_pessoas(dbsession, quantidade):
    # Verificar quais CPFs e emails já existem no banco
    pessoas_existentes = dbsession.fetch_all("SELECT CPF, EMAIL FROM PESSOA")
    cpfs_existentes = {row['cpf'] for row in pessoas_existentes}
    emails_existentes = {row['email'] for row in pessoas_existentes}

    cpfs_gerados = set()  # Garante CPFs únicos no batch atual
    emails_usados = set()  # Garante emails únicos no batch atual

    pessoas_data = []

    print(f"Gerando {quantidade} pessoas...")

    # Criar usuários de teste no início
    # CPFs fixos para garantir consistência entre repopulações
    usuarios_teste = [
        ("admin@usp.br", "Administrador Teste", "75005017900"),
        ("interno@usp.br", "Interno Teste", "75005018033"),
        ("funcionario@usp.br", "Funcionário Teste", "75005018111"),
        ("cadastro@usp.br", "Teste Cadastro", "01995923222"),
    ]

    for email_teste, nome_teste, cpf_fixo in usuarios_teste:
        # Verificar se já existe no banco
        if cpf_fixo in cpfs_existentes or email_teste in emails_existentes:
            print(f"   ⚠️  Usuário de teste já existe: {email_teste} (CPF: {cpf_fixo})")
            continue

        cpf_teste = cpf_fixo
        cpfs_gerados.add(cpf_teste)

        celular_teste = (
            f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        )
        data_nascimento_teste = fake.date_of_birth(minimum_age=18, maximum_age=80)

        pessoas_data.append(
            (
                cpf_teste,
                nome_teste,
                email_teste,
                celular_teste,
                data_nascimento_teste,
            )
        )
        emails_usados.add(email_teste)
        print(f"   📧 Email fixo para login: {email_teste} (CPF: {cpf_teste})")

    # Calcular quantas pessoas ainda precisam ser geradas
    pessoas_restantes = quantidade - len(pessoas_data)

    for i in range(pessoas_restantes):
        # Gera CPF único (não existe no banco nem no batch atual)
        cpf = gerar_cpf()
        tentativas_cpf = 0
        while cpf in cpfs_existentes or cpf in cpfs_gerados:
            cpf = gerar_cpf()
            tentativas_cpf += 1
            if tentativas_cpf > 1000:
                # Se não conseguir gerar após muitas tentativas, pular esta pessoa
                print(f"   ⚠️  Não foi possível gerar CPF único após 1000 tentativas. Pulando pessoa {i+1}.")
                continue

        cpfs_gerados.add(cpf)

        nome = fake.name()

        # Gera email único (não existe no banco nem no batch atual)
        email = fake.email()
        tentativas_email = 0
        while email in emails_existentes or email in emails_usados:
            email = fake.email()
            tentativas_email += 1
            if tentativas_email > 1000:
                # Se não conseguir gerar após muitas tentativas, usar CPF como base
                email = f"{cpf}@usp.br"
                break
        emails_usados.add(email)

        celular = f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        data_nascimento = fake.date_of_birth(minimum_age=18, maximum_age=80)

        pessoas_data.append((cpf, nome, email, celular, data_nascimento))

    if not pessoas_data:
        print("⚠️  Nenhuma pessoa nova para inserir. Todas já existem no banco.")
        return

    # Inserir diretamente no banco usando executemany com ON CONFLICT
    query = """
        INSERT INTO PESSOA (CPF, NOME, EMAIL, CELULAR, DATA_NASCIMENTO)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (CPF) DO NOTHING
    """

    print(f"Inserindo {len(pessoas_data)} pessoas no banco...")
    dbsession.executemany(query, pessoas_data)
    print(f"✅ {len(pessoas_data)} pessoas inseridas com sucesso!")


if __name__ == "__main__":
    dbsession = DBSession()
    try:
        gerar_pessoas(dbsession, 10000)
    finally:
        dbsession.close()
