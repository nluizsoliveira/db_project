import re
from typing import Optional


def simplify_database_error(error_message: str) -> str:
    """
    Simplifica mensagens de erro do PostgreSQL para exibição ao usuário.

    Args:
        error_message: Mensagem de erro completa do PostgreSQL

    Returns:
        Mensagem de erro simplificada e amigável ao usuário
    """
    if not error_message:
        return "Erro desconhecido"

    error_lower = error_message.lower()

    # Foreign key constraint violations
    if "foreign key constraint" in error_lower:
        # Extrai o nome da constraint e a tabela relacionada
        fk_match = re.search(r'constraint "([^"]+)"', error_lower)
        table_match = re.search(r'not present in table "([^"]+)"', error_lower)
        key_match = re.search(r'key \(([^)]+)\)=\(([^)]+)\)', error_lower)

        if table_match:
            table_name = table_match.group(1)
            if key_match:
                field_name = key_match.group(1)
                field_value = key_match.group(2)

                # Mapeia nomes de tabelas para mensagens amigáveis
                table_messages = {
                    "interno_usp": "O CPF informado não está cadastrado como interno USP",
                    "externo": "O CPF informado não está cadastrado como externo",
                    "atividade": "A atividade informada não existe",
                    "equipamento": "O equipamento informado não existe",
                    "instalacao": "A instalação informada não existe",
                }

                message = table_messages.get(table_name, f"O valor informado não existe na tabela {table_name}")
                return message

        return "O valor informado não existe ou não é válido"

    # Unique constraint violations
    if "unique constraint" in error_lower or "duplicate key" in error_lower:
        return "Já existe um registro com esses dados"

    # Not null constraint violations
    if "not null" in error_lower:
        field_match = re.search(r'column "([^"]+)"', error_lower)
        if field_match:
            field = field_match.group(1)
            return f"O campo {field} é obrigatório"
        return "Um campo obrigatório não foi preenchido"

    # Check constraint violations
    if "check constraint" in error_lower:
        return "Os dados informados não atendem às regras de validação"

    # Generic database errors
    if "violates" in error_lower:
        return "Os dados informados não são válidos"

    # Connection errors
    if "connection" in error_lower or "timeout" in error_lower:
        return "Erro de conexão com o banco de dados"

    # Retorna a mensagem original se não houver padrão conhecido
    # Mas limpa informações técnicas desnecessárias
    cleaned = re.sub(r'DETAIL:.*', '', error_message, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'CONTEXT:.*', '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'PL/pgSQL.*', '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = cleaned.strip()

    # Se ainda for muito longa, pega apenas a primeira linha
    if len(cleaned) > 200:
        cleaned = cleaned.split('\n')[0].strip()
        if len(cleaned) > 200:
            cleaned = cleaned[:197] + "..."

    return cleaned if cleaned else "Erro ao processar a operação"
