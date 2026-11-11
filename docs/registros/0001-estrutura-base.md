# Registro nº 0001 — Estrutura base do projeto

| Campo | Valor |
|---|---|
| **Número** | 0001 |
| **Data da alteração** | 09/11/2026, 20:46 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Áreas afetadas** | Configuração, tema, componentes shadcn/ui, autenticação de exemplo |

## O que foi feito

- Criado o projeto **Next.js 15 (App Router) + TypeScript + Tailwind CSS 3 + shadcn/ui** em `portal-cpa/`.
- Copiados para `src/components/ui/` os componentes shadcn usados nas telas: `button`, `input`, `label`, `card`, `badge`, `dialog`, `scroll-area`.
  - `"use client"` adicionado em `dialog.tsx` e `scroll-area.tsx` (necessário no App Router).
  - Texto do botão de fechar do `dialog` traduzido para "Fechar".
- Tema definido em `src/app/globals.css` e `tailwind.config.ts` a partir dos mockups: azul-marinho (`--primary`), cinza de painel (`--card`), cores de status (`--status-negado`, `--status-analise`, `--status-concluido`).
- Fonte **Share Tech Mono** (Google Fonts, via `next/font`) como fonte única da interface, por ser a que mais se aproxima dos mockups.
- Fundos: `.bg-login` (degradê azul → vermelho com grade, feito em CSS) e `.bg-home` (usa `public/images/home-bg.jpg`, com degradê de reserva).
- Autenticação **fictícia** (apenas para demonstrar o fluxo):
  - `src/lib/auth-mock.ts`: 4 usuários de exemplo, um por perfil (aluno, coordenador, administrador, avaliador externo).
  - `src/lib/session.ts` e `src/app/login/actions.ts`: cookie `cpa_sessao` (httpOnly, 8 h) com nome e perfil.
  - `src/middleware.ts`: sem sessão → `/login`; com sessão em `/login` → `/inicio`.
- Componente compartilhado `src/components/barra-institucional.tsx` (faixa azul-marinho de cabeçalho/rodapé).

## Arquivos criados

`package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/middleware.ts`, `src/lib/{utils,perfis,auth-mock,session}.ts`, `src/app/login/actions.ts`, `src/components/barra-institucional.tsx`, `src/components/ui/*`.

## Observações

- **Não foi possível instalar dependências nem executar o projeto** neste ambiente (sem acesso à rede). O código não foi compilado nem testado; rodar `pnpm install` e `pnpm dev` é o primeiro passo.
- A autenticação de exemplo deve ser substituída por login real (SSO institucional, Auth.js ou API) antes de qualquer uso fora de desenvolvimento. O cookie atual **não é assinado**.
- A skill `web-artifacts-builder` empacota projetos Vite em um HTML único; como o pedido foi Next, esse empacotamento não foi usado.
