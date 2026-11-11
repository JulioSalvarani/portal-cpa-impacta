# Registro nº 0002 — Tela de Login - CPA

| Campo | Valor |
|---|---|
| **Número** | 0002 |
| **Data da alteração** | 09/11/2026, 20:46 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Rota** | `/login` |

## O que foi feito

Tela construída conforme o mockup e os requisitos:

- **Campo "E-Mail"** e **campo "Senha"**, com rótulo à esquerda do campo (empilhado em telas pequenas).
- **Botão "Entrar"** (pílula azul-marinho) que envia as credenciais a uma Server Action; mostra "Entrando…" durante o envio.
- Título "Login - CPA" em pílula azul-marinho, cartão cinza centralizado, faixas azul-marinho de cabeçalho e rodapé e fundo em degradê com grade.
- Credenciais inválidas exibem a mensagem genérica "E-mail ou senha inválidos." (não revela se o e-mail existe). Erro anunciado a leitores de tela (`role="alert"`).
- O perfil (aluno, coordenador, administrador ou avaliador externo) vem do cadastro do usuário e é gravado na sessão.

## Arquivos

`src/app/login/page.tsx`, `src/components/login-form.tsx`, `src/app/login/actions.ts` (ver também registro 0001).

## Para testar

Qualquer usuário de `src/lib/auth-mock.ts`, por exemplo `admin@example.com` / `cpa2026`.
