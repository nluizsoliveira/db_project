import subprocess
import sys
from pathlib import Path

# Lista de scripts geradores organizados por domínio (na ordem de dependência)
scripts = [
    # Domínio: Pessoas
    "pessoas/01gerar_pessoas.py",
    "pessoas/02gerar_interno_usp.py",
    "pessoas/03gerar_funcionario.py",
    "pessoas/04gerar_atribuicoes.py",
    "pessoas/05gerar_restricao.py",
    "pessoas/06gerar_educador_fisico.py",

    # Domínio: Infraestrutura
    "infraestrutura/07gerar_instalacao.py",
    "infraestrutura/08gerar_equipamento.py",
    "infraestrutura/09gerar_doacao_equipamento.py",

    # Domínio: Reservas
    "reservas/10gerar_reservas.py",
    "reservas/19gerar_reserva_equipamento.py",

    # Domínio: Atividades
    "atividades/11gerar_atividade.py",
    "atividades/12gerar_ocorrencia_semanal.py",
    "atividades/13gerar_conduz_atividade.py",
    "atividades/14gerar_participacao_atividade.py",

    # Domínio: Eventos
    "eventos/15gerar_evento.py",
    "eventos/16gerar_supervisores_eventos.py",

    # Domínio: Grupos
    "grupos/17gerar_grupo_extensao.py",
    "grupos/18gerar_atividade_grupo_extensao.py"
]

try:
    # Rodar os scripts de geração
    for script in scripts:
        print(f"\n{'='*60}")
        print(f"Rodando {script}...")
        print(f"{'='*60}")
        subprocess.run([sys.executable, script], check=True, cwd=Path(__file__).parent)
        print(f"✅ {script} concluído.\n")

    print("\n" + "="*60)
    print("✅ Todos os dados foram gerados e inseridos no banco com sucesso!")
    print("="*60)
except Exception as e:
    print(f"\n❌ Erro ao executar scripts: {e}")
    raise
