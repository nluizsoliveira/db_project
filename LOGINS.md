# Logins e Senhas Padrão

## Senha Padrão

- **Senha para todos os usuários internos**: `senha123`

## Logins Internos (Dados Fixos Gerados)

| Email                | CPF           | NUSP       | Nome                | Tipo                      | Atribuição    |
| -------------------- | ------------- | ---------- | ------------------- | ------------------------- | ------------- |
| `admin@usp.br`       | `75005017900` | `12345678` | Administrador Teste | Interno USP + Funcionário | Administrador |
| `interno@usp.br`     | `75005018033` | `12345679` | Interno Teste       | Interno USP               | -             |
| `funcionario@usp.br` | `75005018111` | `12345680` | Funcionário Teste   | Interno USP + Funcionário | Variada       |
| `cadastro@usp.br`    | `01995923222` | `12345681` | Teste Cadastro      | Interno USP               | -             |

**Senha**: `senha123` para todos

**Notas**:

- `admin@usp.br` sempre recebe a atribuição "Administrador"
- `funcionario@usp.br` recebe uma atribuição aleatória (não Administrador)
- `interno@usp.br` não é funcionário (apenas Interno USP)
- `cadastro@usp.br` é usado para testes de cadastro:
  - **NÃO possui conta em USUARIO_SENHA** (criado apenas como pessoa e interno)
  - Pode ser usado para testar o fluxo completo de solicitação de cadastro
  - Use CPF `01995923222` e NUSP `12345681` para solicitar cadastro

## Convite Externo (Dados Fixos Gerados)

| Campo          | Valor                                 |
| -------------- | ------------------------------------- |
| **Token**      | `teste123`                            |
| **Status**     | PENDENTE                              |
| **Email**      | `teste@externo.com`                   |
| **Nome**       | Usuário Externo de Teste              |
| **Documento**  | `12345678901`                         |
| **Telefone**   | `(11) 99999-9999`                     |
| **Observação** | Convite de teste para desenvolvimento |

**Nota**: Este convite é criado automaticamente para facilitar testes de login externo.
