# Arquitetura e Plano de Implementação Lógica — Portal CPA

| Campo | Valor |
|---|---|
| **Projeto** | Portal CPA — Comissão Própria de Avaliação (Faculdade Impacta) |
| **Tipo** | Documentação Técnica Definitiva (Arquitetura, Banco de Dados, RBAC, Regras de Negócio e Deploy) |
| **Stack Principal** | Next.js 16 (App Router) · TypeScript · Prisma 7 · Supabase (Auth, PostgreSQL, Storage) · Looker Studio |
| **Estado do Projeto** | Implementação concluída, saneada e validada para produção |

---

## 1. Stack e Arquitetura Geral

- **Framework:** Next.js 16 (App Router) + TypeScript (`next.config.ts` configurado com `cacheComponents: false` para renderização dinâmica autenticada e `experimental.serverActions.bodySizeLimit: "20mb"` para upload de PDFs).
- **UI & Estilos:** shadcn/ui (Radix UI, preset Vega) + **CSS puro próprio** (`src/app/cpa.css`, `src/app/cpa-resposta.css` e helpers geométricos `src/lib/cpa-box.ts`).
- **Autenticação:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) com sessão via cookies HTTP-only (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), usado para login, logout e leitura do usuário autenticado. Para criação e exclusão administrativa de usuários em `/perfis`, utiliza-se `createAdminClient()` (`src/lib/supabase/admin.ts`) com `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no servidor.
- **ORM e Banco:** PostgreSQL no Supabase acessado **100% no servidor** via **Prisma 7** (`@prisma/client@7` + `@prisma/adapter-pg@7`, singleton em `src/lib/prisma.ts`) em Server Components e Server Actions.
- **Storage de Documentos:** Supabase Storage (bucket público `relatorios-cpa` para PDFs de relatórios de autoavaliação e boletins informativos).
- **Dashboards Analíticos:** Incorporação via `<iframe>` dos 4 relatórios oficiais do **Google Data Studio / Looker Studio** fornecidos pela CPA.

### Regras Críticas do Prisma 7 + Supabase + Next.js
1. **Schemas:** `prisma/schema.prisma` mapeia `schemas = ["public", "auth"]`. **Nunca apagar** os models do schema `auth` gerados pelo `db pull`, pois `public.profiles` possui chave estrangeira para `auth.users`.
2. **Conexões e Pool Serverless:**
   - `DATABASE_URL` (Transaction Pooler, porta `6543`, `?pgbouncer=true`) → usada em runtime pelo `PrismaPg` em `src/lib/prisma.ts`, com limite baixo de conexões simultâneas (`max`) por instância serverless em produção.
   - `DIRECT_URL` (Session Pooler, porta `5432`) → usada pela CLI via `prisma.config.ts`.
   - O `package.json` inclui `"postinstall": "prisma generate"` para recriar `src/generated/prisma` automaticamente durante o build na Vercel.
3. **Evolução do Banco:** **Não usar** `prisma migrate dev` nem `prisma db push`. Alterações estruturais são aplicadas diretamente no Supabase (SQL Editor / Table Editor) seguidas de:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```
   *(Após regenerar o client, reiniciar o servidor `npm run dev` para recarregar o singleton em memória.)*
4. **Trigger de Novos Usuários (`private.handle_new_user`):** A função vinculada ao trigger de `auth.users` resolve dinamicamente o `id` numérico (`int8`) de `'aluno'` na tabela `public.roles` e preenche `public.profiles` usando `raw_user_meta_data` (`nome` / `full_name` / `Display name`) com `ON CONFLICT (user_id) DO NOTHING`.
5. **Serialização e Normalização Server → Client:**
   - Normalizar strings de perfil lidas do banco com `.trim().toLowerCase()`.
   - Converter campos `int8` (`id`, `role`, `status`) com `Number(...)` e `numeric` (`ano`) com `Number(...)` antes de enviá-los para Client Components.
6. **Segurança (RLS):** Manter o *Row Level Security* ativado em todas as tabelas do schema `public` no Supabase sem políticas abertas (bloqueando leitura direta via `anon key` no navegador enquanto o Prisma opera via pooler no servidor).
7. **Interceptação de Rotas:** Utilizar `src/middleware.ts` para validação de sessão e redirecionamentos automáticos entre rotas públicas e protegidas.

---

## 2. Modelo de Dados Consolidado (Supabase — `schema: public`)

Todas as **8 tabelas** abaixo compõem o banco de produção e estão sincronizadas com `prisma/schema.prisma`:

| Tabela | Colunas e Tipos | Chaves, Relações e Observações | Papel na Lógica |
|---|---|---|---|
| `cpas` | `id` (`int8`), `form_link` (`varchar`), `ano` (`numeric`), `title` (`text`), `is_active` (`bool`), `perfis_permitidos` (`text[]`) | PK: `id`; Unique: `form_link`. Ciclo **anual** (sem coluna `semestre`). | Controla o banner anual em `/inicio`, a cor de `.cpa-dot`, o link do Google Forms e qual cargo visualiza cada pesquisa. Regra de **apenas 1 CPA ativa por perfil** garantida via transação. |
| `roles` | `id` (`int8`), `role` (`text`), `cor_hex` (`text`, nullable) | PK: `id`; Unique: `role`. | Define os **5 perfis oficiais** em ordem hierárquica: `1: aluno` (`NULL`), `2: professor` (`NULL`), `3: coordenador` (`NULL`), `4: avaliador_externo` (`'#012a55'`) e `5: admin` (`NULL`). |
| `profiles` | `user_id` (`uuid`), `email` (`text`), `nome` (`text`), `role` (`int8`) | PK/FK: `user_id` → `auth.users.id`; FK: `role` → `roles.id`. | Estende o usuário do Supabase Auth com nome e cargo (`role` gerenciado via CRUD completo pelo `admin` em `/perfis`). |
| `areas` | `nome_area` (`text`) | PK: `nome_area`. | Popula o dropdown de áreas responsáveis (`Coordenação`, `Infraestrutura`, `Reitoria`, `Secretaria`, `Secretaria de Coordenação`, `TI`). |
| `status_respostas` | `id` (`int8`), `status` (`text`), `hex` (`text`) | PK: `id`. | Categorias únicas (`1: Resolvido` `#0ee80e`, `2: Inapto` `#f3ef00`, `3: Impertinente` `#f20000`) para barras e etiquetas. |
| `respostas` | `id` (`int8`), `title` (`text`), `area` (`text`), `status` (`int8`), `ano` (`numeric`), `resposta` (`text`), `perfis_permitidos` (`text[]`) | PK: `id`; FK: `area` → `areas.nome_area`; FK: `status` → `status_respostas.id`. | Armazena as devolutivas publicadas pela CPA (`resposta` = justificativa) e o array de perfis autorizados a visualizá-las. |
| `dashboards_cpa` | `id` (`int8`), `titulo` (`text`), `embed_url` (`text`), `embed_url_externo` (`text`, nullable), `perfis_permitidos` (`text[]`), `ordem` (`int2`), `ativo` (`bool`), `created_at` (`timestamptz`) | PK: `id`. | Armazena os 4 embeds oficiais do Google Data Studio (`Aluno(a) Presencial`, `Aluno(a) EAD`, `Professores`, `Corpo Técnico Administrativo`), o link `@impacta`, o link externo (MEC) e os perfis autorizados. |
| `relatorios` | `id` (`int8`), `titulo` (`text`), `tipo` (`text`), `ano` (`numeric`), `arquivo_url` (`text`), `created_at` (`timestamptz`) | PK: `id`; Check em `tipo` (`'Relatório de Autoavaliação'` ou `'Boletim Informativo'`). | Cataloga os PDFs hospedados no bucket público `relatorios-cpa` do Supabase Storage para download geral e upload/exclusão por `admin` e `coordenador`. |

---

## 3. Autenticação, Sessão e Controle de Acesso (RBAC — 5 Perfis)

### 3.1 Clientes Supabase e Guards (`src/lib/supabase/`, `src/lib/auth.ts` e `src/middleware.ts`)
- `createClient()` (`src/lib/supabase/server.ts`): cria o cliente server-side usando `cookies()` do `next/headers`.
- `createAdminClient()` (`src/lib/supabase/admin.ts`): cria o cliente administrativo com `SUPABASE_SERVICE_ROLE_KEY` para criar e excluir contas em `auth.users`.
- `getUsuarioLogado()` (`src/lib/auth.ts`): obtém `user` via `supabase.auth.getUser()`, consulta `prisma.profiles.findUnique({ where: { user_id: user.id }, include: { roles: true } })`, normaliza `role` para `PerfilCpa` (`"aluno" | "professor" | "coordenador" | "avaliador_externo" | "admin"`) e carrega `corHex: string | null` a partir de `roles.cor_hex`.
- Helpers e Guards de Autorização (`src/lib/auth.ts`):
  - `exigirUsuarioLogado()`: redireciona para `/login` se não houver sessão válida (usado em `/inicio`, `/devolutivas`, `/resultados` e `/relatorios`).
  - `temVisaoGlobalDevolutivas(role)` / `PERFIS_VISAO_GLOBAL_DEVOLUTIVAS`: libera leitura de todas as devolutivas e exibição das etiquetas de público-alvo para `["admin", "coordenador", "avaliador_externo"]`.
  - `podeGerenciarRelatorios(role)` / `exigirGestorRelatorios()`: autoriza upload e exclusão de PDFs em `/relatorios` para `["admin", "coordenador"]`.
  - `exigirAdmin()`: verifica se `usuario.role === "admin"`; caso contrário, executa `redirect("/inicio")` (usado em `/cpas`, `/devolutivas/responder`, `/perfis` e nas respectivas Server Actions).
- `src/middleware.ts`: redireciona visitantes não autenticados para `/login` e usuários já autenticados de `/` ou `/login` para `/inicio`.

### 3.2 Fluxo de Login e Logout (`src/app/actions/auth.ts`)
- **Login (`/login` → `src/components/login-form.tsx` + `src/app/actions/auth.ts`):**
  - Formulário ligado à Server Action `loginAction`, executando `supabase.auth.signInWithPassword({ email, password })`, validando o perfil em `profiles` e redirecionando para `/inicio`.
- **Logout (`/inicio` → `src/components/home-header.tsx` + `src/app/actions/auth.ts`):**
  - Botão de saída (`LogOut` com `.cpa-logout`) dentro de `<form action={logoutAction}>` executando `supabase.auth.signOut()` e redirecionando para `/login`.

### 3.3 Matriz Consolidada de Permissões por Perfil (`roles`)

| ID | Perfil (`PerfilCpa`) | Regra de E-mail (`/perfis`) | Painel `/inicio` | Resultados `/resultados` | Devolutivas `/devolutivas` | Relatórios `/relatorios` | Ações Administrativas |
|---|---|---|---|---|---|---|---|
| `1` | **`aluno`** | Obrigatório conter `impacta` | Banner CPA + dot status; **4 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Apenas *Aluno(a) Presencial* e *Aluno(a) EAD* | Apenas destino **Alunos** (sem tag de público) | Consulta e download de PDFs | Nenhuma |
| `2` | **`professor`** | Obrigatório conter `impacta` | Banner CPA + dot status; **4 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Apenas dashboards com `'professor'` | Apenas destino **Professores** (sem tag de público) | Consulta e download de PDFs | Nenhuma |
| `3` | **`coordenador`** | Obrigatório conter `impacta` | Banner CPA + dot status; **4 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Todos os 4 dashboards | **Todas** (com tag `aluno` / `prof` / `func`) | Consulta, download, **upload e exclusão** de PDFs | Gestão de relatórios (`/relatorios`) |
| `4` | **`avaliador_externo`** *(MEC)* | Livre (sem restrição de domínio) | Banner `"SEJA BEM VINDO"` + dot `#012a55` (camuflado); **3 botões** (`Devolutivas`, `Resultados`, `Relatórios`) | Todos os 4 dashboards (prioriza `embed_url_externo` se preenchido) | **Todas** (com tag `aluno` / `prof` / `func`) | Consulta e download de PDFs | Nenhuma |
| `5` | **`admin`** *(CPA)* | Obrigatório conter `impacta` | Banner CPA + dot status; **6 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`, `CPAs`, `Perfis`) | Todos os 4 dashboards | **Todas** (com tag `aluno` / `prof` / `func`) + criar/editar/excluir | Consulta, download, **upload e exclusão** de PDFs | CRUD completo em `/cpas`, `/devolutivas` (`/responder`), `/relatorios` e `/perfis` |

---

## 4. Implementação Lógica por Módulo

### 4.1 Painel Principal (`/inicio` — `src/app/inicio/page.tsx`)
- Obtém `usuario = await exigirUsuarioLogado()` e repassa `corHex` para `StatusPesquisa`.
- Quando `usuario.role === "avaliador_externo"`, a página **não consulta** a tabela `cpas`, pois o banner exibe a mensagem fixa `"SEJA BEM VINDO"`, a bolinha `.cpa-dot` recebe `backgroundColor: corHex` (`#012a55`, camuflada no fundo azul-marinho) e o botão de acesso à pesquisa é omitido, restando **3 botões** (`Devolutivas`, `Resultados`, `Relatórios`).
- Para os demais perfis, busca a pesquisa direcionada ao cargo ativo:
  ```ts
  const cpa = await prisma.cpas.findFirst({
    where: { perfis_permitidos: { has: usuario.role } },
    orderBy: [{ is_active: "desc" }, { ano: "desc" }, { id: "desc" }],
  });
  ```
- `HomeHeader`: exibe `"Seja bem vindo, {usuario.nome}!"`, o rótulo estático do cargo ativo (`ROTULO_PERFIL[role]`), o botão de logout (`LogOut` → `logoutAction`) e o botão `"i"` (`ContatoInfoDialog` com informações institucionais e links para **Google Chats** e **Google Meet**).
- `StatusPesquisa`: exibe `cpa.title` centralizado no banner, indicador `.cpa-dot` dinâmico (`is_active`), botão **Acessar** (`cpa.form_link` em nova aba) e **4 botões** para `aluno`, `professor` e `coordenador` ou **6 botões** para `admin` (adicionando **CPAs** e **Perfis**; o atalho **Responder** foi removido de `/inicio`, concentrando a criação de devolutivas dentro de `/devolutivas`).

### 4.2 Gerenciamento de CPAs (`/cpas` — `src/app/cpas/page.tsx` e `src/app/actions/cpas.ts`)
- Protegida com `await exigirAdmin()`.
- Lista todas as pesquisas de `cpas` ordenadas por `is_active` descendente, `ano` descendente e `id` descendente.
- **Validação de intervalo de anos (`src/lib/cpas-data.ts` e `src/app/actions/cpas.ts`):**
  - Define `ANO_MINIMO_CPA = 2003` e `anoAtualBrasil()` (ano corrente calculado no fuso `America/Sao_Paulo`), exigindo `2003 <= ano <= anoAtual` tanto no formulário quanto na Server Action.
- **Unicidade de CPA ativa por role (`src/app/actions/cpas.ts`):**
  - `criarCpaAction`: cadastra nova CPA anual com `title`, `form_link`, `ano`, `is_active` e `perfis_permitidos: [perfil]`. Quando `is_active = true`, uma transação `prisma.$transaction` encerra (`is_active: false`) **apenas** as CPAs ativas que compartilham o mesmo perfil (`perfis_permitidos: { hasSome: perfisAlvo }`), permitindo **1 CPA aberta por role** simultaneamente.
  - `alternarStatusCpaAction`: lê a CPA-alvo dentro da transação; ao ativá-la, encerra apenas as demais CPAs ativas do mesmo perfil (`id !== alvo`), mantendo o histórico encerrado.
  - `excluirCpaAction`: remove o registro da tabela `cpas`.

### 4.3 Central de Devolutivas (`/devolutivas`, `/devolutivas/responder` e `src/app/actions/devolutivas.ts`)
- **Leitura (`/devolutivas` → `src/app/devolutivas/page.tsx`):**
  - Para `admin`, `coordenador` e `avaliador_externo` (`temVisaoGlobalDevolutivas(usuario.role)`), consulta **todas** as devolutivas de `respostas` (`orderBy: { id: "desc" }`) e ativa `exibirPublico = true`, exibindo em cada card a tag de público-alvo (`rotuloPublicoDevolutiva(perfis)` em `src/lib/devolutivas-data.ts`: `aluno`, `prof` ou `func`).
  - Para `aluno` e `professor`, filtra por `where: { perfis_permitidos: { has: usuario.role } }` com `exibirPublico = false`.
  - Agrupa os registros por `ano` (decrescente) para os cartões `CartaoAno` (recalculando as barras de status conforme a visão do perfil) e passa `isAdmin={usuario.role === "admin"}`, `areas` e `categorias` para edição/exclusão no `RespostaDialog`.
- **Modelo Hierárquico de Destinatários (`src/app/actions/devolutivas.ts`):**
  - Ao criar (`/devolutivas/responder` → `criarDevolutivaAction`, acessado pelo botão **Nova devolutiva** em `/devolutivas`) ou editar (`editarDevolutivaAction`), o formulário envia `name="destino"` com 3 opções de seleção única (`radio`):
    - **Alunos (`"alunos"`):** grava `["aluno", "coordenador", "avaliador_externo", "admin"]`.
    - **Professores (`"professores"`):** grava `["professor", "coordenador", "avaliador_externo", "admin"]`.
    - **Corpo funcional (`"corpo_funcional"`):** grava `["coordenador", "avaliador_externo", "admin"]`.
- **Exclusão (`excluirDevolutivaAction`):** disponível no `RespostaDialog` para `admin` com confirmação inline antes de deletar o registro.

### 4.4 Resultados via Google Data Studio (`/resultados` — `src/app/resultados/page.tsx`)
- Protegida com `await exigirUsuarioLogado()`.
- Consulta `dashboards_cpa` (`where: { ativo: true, perfis_permitidos: { has: usuario.role } }`, `orderBy: [{ ordem: "asc" }, { id: "asc" }]`).
- Se `usuario.role === "avaliador_externo"` e `embed_url_externo` estiver preenchido, utiliza essa URL; caso contrário, utiliza `embed_url`.
- Os filtros de `ANO`, `Semestre`, `Ciclo` e exportação `Download` são operados diretamente dentro do `<iframe>` do Looker Studio.

### 4.5 Repositório de Relatórios e Boletins (`/relatorios` — `src/app/relatorios/page.tsx` e `src/app/actions/relatorios.ts`)
- Protegida com `await exigirUsuarioLogado()`.
- Lista todos os registros de `relatorios` (`orderBy: [{ ano: "desc" }, { id: "desc" }]`) para consulta, filtro por tipo e download por todos os perfis.
- **Gestão compartilhada (`admin` e `coordenador`):**
  - `src/app/relatorios/page.tsx` utiliza `podeGerenciarRelatorios(usuario.role)` para liberar o formulário de upload e a exclusão em `PainelRelatorios`.
  - As Server Actions `publicarRelatorioAction` e `excluirRelatorioAction` (`src/app/actions/relatorios.ts`) são protegidas por `await exigirGestorRelatorios()`, respaldadas no banco pelas políticas de Storage `private.is_admin()` e `private.is_coordenador()` no bucket `relatorios-cpa`.
  - `publicarRelatorioAction`: valida PDF (recomendado `< 4 MB` devido ao teto de `4,5 MB` de payload serverless da Vercel), faz upload para `{ano}/{timestamp}-{nome}.pdf` no bucket `relatorios-cpa`, obtém `publicUrl` e grava os metadados na tabela `relatorios` via Prisma.
  - `excluirRelatorioAction`: remove o PDF do bucket `relatorios-cpa` via `supabase.storage.from("relatorios-cpa").remove(...)` e exclui o registro correspondente na tabela `relatorios`.

### 4.6 Gestão Interna de Perfis (`/perfis` — `src/app/perfis/page.tsx` e `src/app/actions/perfis.ts`)
- Protegida com `await exigirAdmin()`.
- Lista `profiles` (`include: { roles: true }`, `orderBy: { nome: "asc" }`) em `TabelaPerfis`.
- **Regra de Domínio Institucional (`src/lib/perfis-data.ts` e `src/app/actions/perfis.ts`):**
  - `PERFIS_EXIGEM_IMPACTA` (`aluno`, `professor`, `coordenador`, `admin`) exige que o e-mail contenha `"impacta"` (*case-insensitive*, validado por `emailValidoParaPerfil(email, role)` tanto no front-end quanto no back-end). Apenas `avaliador_externo` aceita e-mails sem `"impacta"`.
- Server Actions em `src/app/actions/perfis.ts`:
  - `criarUsuarioAction`: valida o e-mail conforme o cargo, cria a conta no Supabase Auth via `createAdminClient().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nome } })` e realiza `upsert` em `public.profiles`.
  - `editarUsuarioAction`: atualiza `nome` e `role` em `public.profiles`, impedindo que o administrador logado remova seu próprio cargo `admin` e bloqueando a alteração de cargo para um perfil institucional caso o e-mail do usuário não contenha `"impacta"`.
  - `excluirUsuarioAction`: remove o perfil de `public.profiles` e exclui a conta em `auth.users` via `supabaseAdmin.auth.admin.deleteUser(userId)`, bloqueando autoexclusão.

---

## 5. Checklist de Ambiente e Deploy em Produção

1. **Variáveis de Ambiente (`.env.local` e painel da Vercel):**
   - `DATABASE_URL` (Transaction Pooler porta `6543` com `?pgbouncer=true`)
   - `DIRECT_URL` (Session Pooler porta `5432`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(chave `service_role` do Supabase, lida exclusivamente no servidor por `src/lib/supabase/admin.ts`)*
2. **Configurações de Build e Runtime:**
   - `"postinstall": "prisma generate"` presente em `package.json` e arquivo `prisma.config.ts` na raiz.
   - Limite de conexões `max` ajustado no `Pool` de `src/lib/prisma.ts` para o ambiente serverless.
   - Orientação operacional para upload de relatórios em PDF abaixo de **4 MB** em produção (limite HTTP de `4,5 MB` da Vercel).
3. **Políticas de Storage e Auth no Supabase:**
   - Bucket público `relatorios-cpa` com políticas RLS de `INSERT` e `DELETE` restritas a `private.is_admin()` e `private.is_coordenador()`.
   - RLS ativo em todas as 8 tabelas do schema `public` sem políticas abertas.
   - **Site URL** e **Redirect URLs** configurados em **Supabase > Authentication > URL Configuration** com o domínio final (`https://cpa.impacta.edu.br`).
4. **Saneamento de Dados de Teste:**
   - Remover relatórios fictícios, pesquisas de teste em `cpas`, usuários de homologação em `profiles` e confirmar que os 4 embeds oficiais do Google Data Studio (`embed_url` e `embed_url_externo`) e suas permissões em `dashboards_cpa` estão corretamente configurados.