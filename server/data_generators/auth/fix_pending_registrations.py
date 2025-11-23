"""
Script para corrigir solicitações de cadastro PENDENTE que não têm senha.

Este script adiciona senhas no formato correto ("Password: <senha>") às solicitações
PENDENTE que não possuem senha no campo observacoes.
"""

import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from app.database import DBSession

def gerar_senha():
    """Gera uma senha fictícia para solicitações de cadastro."""
    caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    tamanho = random.randint(8, 12)
    return ''.join(random.choice(caracteres) for _ in range(tamanho))

def fix_pending_registrations():
    """
    Atualiza solicitações PENDENTE que não têm senha no formato correto.
    """
    dbsession = DBSession()

    try:
        # Buscar solicitações PENDENTE sem senha ou com senha em formato incorreto
        solicitacoes_sem_senha = dbsession.fetch_all(
            """SELECT ID_SOLICITACAO, OBSERVACOES
               FROM SOLICITACAO_CADASTRO
               WHERE STATUS = 'PENDENTE'
               AND (
                   OBSERVACOES IS NULL
                   OR OBSERVACOES = ''
                   OR OBSERVACOES NOT LIKE 'Password: %%'
               )"""
        )

        if not solicitacoes_sem_senha:
            print("✅ Todas as solicitações PENDENTE já possuem senha no formato correto.")
            return

        print(f"Encontradas {len(solicitacoes_sem_senha)} solicitações PENDENTE sem senha.")
        print("Atualizando solicitações...")

        atualizadas = 0
        for solic in solicitacoes_sem_senha:
            id_solicitacao = solic['id_solicitacao']
            senha_plana = gerar_senha()
            observacoes = f"Password: {senha_plana}"

            # Usar cursor diretamente para executar com parâmetros posicionais
            with dbsession.connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE SOLICITACAO_CADASTRO
                    SET OBSERVACOES = %s
                    WHERE ID_SOLICITACAO = %s
                """, (observacoes, id_solicitacao))
            dbsession.connection.commit()

            atualizadas += 1

        print(f"✅ {atualizadas} solicitações PENDENTE atualizadas com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao atualizar solicitações: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        dbsession.close()

if __name__ == "__main__":
    fix_pending_registrations()
