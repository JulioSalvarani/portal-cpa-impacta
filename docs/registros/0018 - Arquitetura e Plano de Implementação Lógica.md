# Registro nº 0018 — Arquitetura e Plano de Implementação Lógica

| Campo | Valor |
|---|---|
| **Número** | 0018 |
| **Data da alteração** | 16/11/2026 (America/Sao_Paulo) |
| **Tipo** | Criação (Especificação técnica da implementação lógica) |
| **Estado do projeto** | Protótipo visual concluído (0001–0017); banco conectado via Prisma 7 |
| **Finalidade** | Documento de contexto técnico para guiar a implementação funcional do Portal CPA em novas conversas, sem alterar o sistema visual/CSS aprovado |

---

## 1. Stack e Arquitetura Geral

- **Framework:** Next.js (App Router) + TypeScript
- **UI & Estilos:** shadcn/ui (Radix UI, preset Vega) + **CSS puro próprio** (`src/app/cpa.css`, `src/app/cpa-resposta.css` e helpers `src/lib/cpa-box.ts`)
- **Autenticação:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) com sessão via cookies HTTP-only, usado **exclusivamente** para autenticação e leitura do usuário autenticado
- **ORM e Banco:** PostgreSQL no Supabase acessado **100% no servidor** via **Prisma 7** (`@prisma/client@7` + `@prisma/adapter-pg@7`) em Server Components, Server Actions e Route Handlers

### Regras Críticas do Prisma 7 + Supabase
1. **Schemas:** `prisma/schema.prisma` mapeia `schemas = ["public", "auth"]`. **Nunca apagar** os models do schema `auth` gerados pelo `db pull`, pois `public.profiles` possui chave estrangeira para `auth.users`.
2. **Conexões:**
   - `DATABASE_URL` (Transaction Pooler, porta `6543`, `?pgbouncer=true`) → usada em runtime pelo `PrismaPg` em `src/lib/prisma.ts`.
   - `DIRECT_URL` (Session Pooler, porta `5432`) → usada pela CLI via `prisma7.config.ts`.
3. **Evolução do Banco:** **Não usar** `prisma migrate dev` nem `prisma db push`. Alterações estruturais são feitas direto no Supabase (SQL Editor/Table Editor) seguidas de `npx prisma db pull` e `npx prisma generate`.
4. **Segurança (RLS):** Como o acesso aos dados ocorre exclusivamente via Prisma no servidor, recomenda-se ativar o RLS nas tabelas do schema `public` no Supabase sem criar políticas públicas (bloqueando consultas via `anon key` no cliente enquanto o Prisma opera normalmente via pooler).

---

## 2. Modelo de Dados Real (Supabase)

Estrutura confirmada no banco (`schema: public`):

| Tabela | Colunas e Tipos | Chaves / Relações | Papel na Lógica |
|---|---|---|---|
| `cpas` | `id` (`int8`), `form_link` (`varchar`), `ano` (`numeric`), `semestre` (`int2`), `title` (`text`), `is_active` (`bool`) | PK: `id`; Unique: `form_link` | Controla o banner da pesquisa no painel, a cor do indicador `.cpa-dot` e o link do Google Forms. |
| `roles` | `id` (`int8`), `role` (`text`) | PK: `id`; Unique: `role` | Padronizada apenas em **`1: user`** (aluno/comunidade) e **`2: admin`** (coordenação/administração). Remover registros redundantes (`aluno`, `coordenacao`) para evitar duplicidade. |
| `profiles` | `user_id` (`uuid`), `email` (`text`), `nome` (`text`), `role` (`int8`) | PK/FK: `user_id` → `auth.users.id`; FK: `role` → `roles.id` | Estende o usuário do Supabase Auth com nome de exibição e perfil de permissão (contas pré-cadastradas pela instituição, sem trigger). |
| `areas` | `nome_area` (`text`) | PK: `nome_area` | Popula o dropdown de áreas responsáveis (`Coordenação`, `Infraestrutura`, `Reitoria`, `Secretaria`, `Secretaria de Coordenação`, `TI`). |
| `status_respostas` | `id` (`int8`), `status` (`text`), `hex` (`text`) | PK: `id` | Armazena as categorias únicas (`Resolvido`, `Inapto`, `Impertinente`) e suas cores hexadecimais para barras e etiquetas. |
| `respostas` | `id` (`int8`), `title` (`text`), `area` (`text`), `status` (`int8`), `ano` (`numeric`), `resposta` (`text`) | PK: `id`; FK: `area` → `areas.nome_area`; FK: `status` → `status_respostas.id` | Armazena as devolutivas publicadas pela coordenação (`resposta` = texto da justificativa). |

---

## 3. Autenticação, Sessão e Controle de Acesso (RBAC)

### 3.1 Clientes Supabase (`src/lib/supabase/`)
- `server.ts`: cria o cliente server-side usando `cookies()` do `next/headers` (para Server Components, Server Actions e Route Handlers).
- `middleware.ts`: atualiza o token da sessão do Supabase Auth a cada requisição.

### 3.2 Fluxo de Login e Logout
- **Login (`/login` → `src/components/login-form.tsx`):**
  - Converter o container dos inputs em um `<form>` ligado a uma **Server Action** (`loginAction`).
  - Executar `supabase.auth.signInWithPassword({ email, password })`.
  - Se houver erro de credenciais, exibir mensagem discreta no cartão sem alterar o posicionamento dos elementos; se sucesso, executar `redirect("/inicio")`.
- **Helper de Sessão (`src/lib/auth.ts`):**
  - Função server-side `getUsuarioLogado()`: obtém `user` via `supabase.auth.getUser()` e consulta `prisma.profiles.findUnique({ where: { user_id: user.id }, include: { roles: true } })`.
- **Logout (`/inicio` → `src/components/home-header.tsx`):**
  - Substituir o `<Link href="/login">` do botão voltar (`Undo2`) por um `<form action={logoutAction}>` que executa `supabase.auth.signOut()` e redireciona para `/login`.

### 3.3 Matriz de Permissões e Proteção de Rotas (`src/middleware.ts`)
- **Usuário não autenticado:** qualquer acesso a `/inicio`, `/devolutivas`, `/resultados` ou `/devolutivas/responder` redireciona para `/login`.
- **Usuário autenticado acessando `/` ou `/login`:** redireciona para `/inicio`.
- **Controle por Perfil (`roles.role`):**
  - **`user` (aluno):** acessa apenas `/inicio` e `/devolutivas`. Os botões de **Resultados** e **Responder Devolutiva** **não são renderizados** no DOM. Caso tente acessar `/resultados` ou `/devolutivas/responder` diretamente pela URL, o middleware (e uma verificação redundante nos respectivos `page.tsx` e Server Actions) redireciona para `/inicio`.
  - **`admin` (coordenação):** visualiza todos os botões no painel e acessa todas as rotas.

---

## 4. Implementação Lógica por Tela

### 4.1 Painel Principal (`/inicio`)
- **Busca de Dados (Server Component `src/app/inicio/page.tsx`):**
  - Busca `usuario = await getUsuarioLogado()`.
  - Busca a pesquisa mais recente: `prisma.cpas.findFirst({ orderBy: [{ ano: "desc" }, { semestre: "desc" }] })`.
- **Cabeçalho (`HomeHeader`):**
  - Exibe `"Seja bem vindo, {usuario.nome}!"` e o perfil ativo (`usuario.roles.role`) no lugar dos textos fixos.
  - O botão `i` abre um `Dialog` informativo sobre o propósito da CPA e o funcionamento do portal.
- **Bloco Central (`StatusPesquisa`):**
  - Banner exibe `cpa.title` (ex.: `"Pesquisa CPA 2026/2 Aberta"` ou `"Encerrada"`).
  - **Indicador `.cpa-dot`:** controlado no front-end a partir de `cpa.is_active` do banco — verde (`#6df24a`) quando `cpa.is_active === true` e vermelho (`#f20000`) quando `cpa.is_active === false`.
  - **Botão "Acessar":** deixa de apontar para `/pesquisa` e passa a ser `<a href={cpa.form_link} target="_blank" rel="noopener noreferrer">` (desabilitado se `cpa.is_active === false`).
  - **Botões "Resultados" e "Responder Devolutiva":** renderizados condicionalmente no servidor **apenas** quando `usuario.roles.role === "admin"`. Para `user`, não são exibidos na tela.

### 4.2 Central de Devolutivas (`/devolutivas`) e Modal Mural
- **Remoção da Busca:** O campo de busca (`#busca-devolutivas` / `.cpa-search`) deve ser **removido** da interface, pois o escopo do projeto terá poucos anos e não exige filtro de pesquisa.
- **Busca de Dados (Server Component `src/app/devolutivas/page.tsx`):**
  - Busca todas as categorias: `prisma.status_respostas.findMany({ orderBy: { id: "asc" } })`.
  - Busca todas as devolutivas: `prisma.respostas.findMany({ include: { status_respostas: true }, orderBy: { id: "desc" } })` (da mais recente para a mais antiga).
- **Agrupamento dos Cards por Ano (`PainelDevolutivas` + `CartaoAno`):**
  - Agrupa `respostas` por `ano` (ordenados do ano mais recente para o mais antigo).
  - Para cada ano, calcula a contagem por `status_respostas.id` e passa para `GraficoStatus`, que renderiza as 3 barras usando `status` e `hex` vindos do banco.
- **Modal Mural (`MuralDialog`):**
  - Ao clicar no card de um ano, recebe **exclusivamente** as devolutivas daquele `ano`, ordenadas da mais recente para a mais antiga (`id` desc).
  - Substitui a barra de rolagem decorativa por rolagem vertical real (`overflow-y: auto`) para suportar todas as devolutivas do ano.
  - Permite alternar qual item está em destaque (expandido) ao clicar nos itens recolhidos.
  - Cada item exibe o `title`, o botão **Ver resposta** (`RespostaDialog`) e a `EtiquetaCategoria` (`status` + `hex`).
  - Ao clicar em **Ver resposta**, `RespostaDialog` exibe `title`, `area`, `EtiquetaCategoria` e o texto completo de `resposta` (justificativa).

### 4.3 Responder Devolutiva (`/devolutivas/responder` — Restrita a `admin`)
- **Escopo:** Contempla **apenas a inclusão** de novas devolutivas (sem edição ou exclusão neste momento).
- **Carregamento Inicial (Server Component `src/app/devolutivas/responder/page.tsx`):**
  - Verifica se o usuário tem perfil `admin`; caso contrário, `redirect("/inicio")`.
  - Consulta `areas = await prisma.areas.findMany({ orderBy: { nome_area: "asc" } })` e `categorias = await prisma.status_respostas.findMany()` para preencher os selects dinamicamente.
- **Submissão (`FormResposta` + Server Action `criarDevolutivaAction`):**
  - Converte o componente em `<form>` ligado à Server Action.
  - Valida no servidor: permissão `admin`, `title` obrigatório, `area` válida, `status` numérico válido e `resposta` (motivo) obrigatória.
  - Define `ano = new Date().getFullYear()` automaticamente no servidor.
  - Grava no banco via `prisma.respostas.create({ data: { title, area, status, ano, resposta } })`.
  - Executa `revalidatePath("/devolutivas")` e redireciona (ou exibe confirmação) para refletir imediatamente no Mural e no gráfico do ano.

### 4.4 Resultados da Pesquisa CPA (`/resultados` — Restrita a `admin`)
- **Estrutura do Formulário (Google Forms):**
  - Cada edição da pesquisa CPA contém uma mistura de **questões objetivas com até 6 alternativas** (escala Likert indo de *Muito ruim* a *Muito bom*) e **questões discursivas** (resposta por escrito).
  - A **última pergunta** do formulário é sempre uma questão discursiva aberta para críticas/sugestões dos alunos; a coordenação lê essas respostas nesta tela e decide manualmente quais demandas relevantes serão transformadas em devolutivas em `/devolutivas/responder`.
- **Arquitetura de Integração (Webhook via Google Apps Script):**
  - Para evitar complexidade de OAuth2, configurar um gatilho `onFormSubmit` no **Google Apps Script** do formulário da CPA que envia um `POST` JSON a cada envio para o Route Handler `src/app/api/forms/webhook/route.ts` (protegido pelo header `x-api-key` com `WEBHOOK_SECRET`).
  - Criar tabelas auxiliares no Supabase (ex.: `cpa_perguntas` e `cpa_respostas_form` vinculadas a `cpas.id`, sinalizando ordem, tipo `objetiva`/`discursiva` e opções) para armazenar as respostas recebidas.
- **Exibição e Adaptação do Gráfico (`src/app/resultados/page.tsx`):**
  - Verifica permissão `admin` e consulta `cpas` ordenadas por `ano` desc, `semestre` desc (`CartaoCpa`).
  - **Atualização no `GraficoPizza`:** expandir o componente (atualmente limitado a 5 fatias `A–E`) para suportar **até 6 fatias/alternativas** (adicionando uma 6ª cor à paleta e exibindo os rótulos da escala *Muito ruim* → *Muito bom*).
  - Questões discursivas (incluindo a pergunta final de sugestões) são listadas em `ul.cpa-lines` com rolagem.
  - Botão **Baixar resultados** (`Download`) gera exportação `.csv` dos dados da CPA; botão **Ver relatório** (`FileText`) abre visualização consolidada otimizada para impressão/PDF.

---

## 5. Restrições de UI/CSS e Regras de Manutenção (Obrigatórias)

1. **Preservação Visual:** Não usar classes utilitárias do Tailwind para layout/posicionamento. Toda geometria usa `box()`, `size()`, `band()` e `u()` (`src/lib/cpa-box.ts`), e a aparência vem de `src/app/cpa.css` e `src/app/cpa-resposta.css`.
2. **Modais:** Manter `className="cpa-modal translate-x-0 translate-y-0"` no `DialogContent` para evitar conflito com o Tailwind v4.
3. **Limpeza de Código Morto:** Ao implementar a autenticação real, remover os mocks não utilizados (`src/lib/auth-mock.ts`, `src/lib/session.ts`, `src/lib/perfis.ts`, `src/app/login/actions.ts`, `src/components/devolutivas/etiqueta-status.tsx`).
4. **Protocolo de Registros:** Toda alteração feita em futuras conversas deve gerar um arquivo `docs/registros/NNNN-assunto.md` (próximo número livre: **0019**) e atualizar `docs/registros/INDEX.md`.

---

## 6. Ordem Sugerida de Implementação

1. **Fase 1 (Auth & RBAC):** Configurar `@supabase/ssr`, `loginAction`, `logoutAction`, `getUsuarioLogado()` e `src/middleware.ts` protegendo `/resultados` e `/devolutivas/responder` (redirecionando `user` para `/inicio`).
2. **Fase 2 (Painel `/inicio`):** Ligar nome/perfil do usuário no `HomeHeader`, título e cor do `.cpa-dot` (`is_active`) no `StatusPesquisa`, link externo do Google Forms no botão **Acessar** e ocultação dos botões restritos para `user`.
3. **Fase 3 (Devolutivas — Leitura):** Ligar `/devolutivas` e `MuralDialog` ao Prisma (`respostas` + `status_respostas`), remover a barra de busca `#busca-devolutivas` e ativar a rolagem real do Mural.
4. **Fase 4 (Devolutivas — Escrita):** Ligar `/devolutivas/responder` ao Prisma (`areas`, `status_respostas` e `create` em `respostas` com `ano = new Date().getFullYear()`).
5. **Fase 5 (Resultados & Google Forms):** Criar tabelas de perguntas/respostas no Supabase, implementar o webhook `/api/forms/webhook` + Apps Script, expandir `GraficoPizza` para até 6 alternativas e conectar `/resultados`.