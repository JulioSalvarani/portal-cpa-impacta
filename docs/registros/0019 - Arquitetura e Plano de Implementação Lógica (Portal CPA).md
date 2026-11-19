# Registro nº 0019 — Arquitetura e Plano de Implementação Lógica

| Campo | Valor |
|---|---|
| **Número** | 0019 |
| **Data da alteração** | 17/11/2026 (America/Sao_Paulo) |
| **Tipo** | Criação (Adequação arquitetural à proposta institucional e integração com Google Data Studio) |
| **Estado do projeto** | Protótipo visual concluído (0001–0017); Prisma 7 conectado; Auth/Logout base em andamento |
| **Finalidade** | Documento de contexto técnico para guiar os chats de implementação funcional do Portal CPA, alinhado à proposta original e aos relatórios do Google Data Studio |

---

## 1. Stack e Arquitetura Geral

- **Framework:** Next.js (App Router, `cacheComponents: false` em `next.config.ts`) + TypeScript
- **UI & Estilos:** shadcn/ui (Radix UI, preset Vega) + **CSS puro próprio** (`src/app/cpa.css`, `src/app/cpa-resposta.css` e helpers `src/lib/cpa-box.ts`)
- **Autenticação:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) com sessão via cookies HTTP-only, usado **exclusivamente** para autenticação e leitura do usuário autenticado
- **ORM e Banco:** PostgreSQL no Supabase acessado **100% no servidor** via **Prisma 7** (`@prisma/client@7` + `@prisma/adapter-pg@7` em `src/lib/prisma.ts`) em Server Components, Server Actions e Route Handlers
- **Storage de Documentos:** Supabase Storage (bucket para PDFs de relatórios e boletins institucionais)
- **Dashboards Analíticos:** Incorporação via `<iframe>` dos 4 relatórios oficiais do **Google Data Studio / Looker Studio** fornecidos pela CPA

### Regras Críticas do Prisma 7 + Supabase + Next.js
1. **Schemas:** `prisma/schema.prisma` mapeia `schemas = ["public", "auth"]`. **Nunca apagar** os models do schema `auth` gerados pelo `db pull`, pois `public.profiles` possui chave estrangeira para `auth.users`.
2. **Conexões:**
   - `DATABASE_URL` (Transaction Pooler, porta `6543`, `?pgbouncer=true`) → usada em runtime pelo `PrismaPg` em `src/lib/prisma.ts`.
   - `DIRECT_URL` (Session Pooler, porta `5432`) → usada pela CLI via `prisma7.config.ts`.
3. **Evolução do Banco:** **Não usar** `prisma migrate dev` nem `prisma db push`. Alterações estruturais são feitas direto no Supabase (SQL Editor/Table Editor) seguidas de `npx prisma db pull --config prisma7.config.ts` e `npx prisma generate --config prisma7.config.ts`.
4. **Serialização Server → Client:** Campos `int8` (`id`, `role`, `status`) retornam como `BigInt` e `numeric` (`ano`) como `Prisma.Decimal`; converter com `Number(...)` antes de enviar para Client Components.
5. **Segurança (RLS):** Manter o RLS ativado nas tabelas do schema `public` no Supabase sem criar políticas públicas (bloqueando leitura direta via `anon key` no cliente enquanto o Prisma opera normalmente via pooler).
6. **Interceptação de Rotas:** Utilizar `proxy.ts` na raiz do projeto (convenção ativa do Next.js no repositório) para validação de sessão e redirecionamentos.

---

## 2. Modelo de Dados (Supabase)

Estrutura existente e tabelas complementares (`schema: public`):

| Tabela | Colunas e Tipos | Chaves / Relações | Papel na Lógica |
|---|---|---|---|
| `cpas` | `id` (`int8`), `form_link` (`varchar`), `ano` (`numeric`), `semestre` (`int2`), `title` (`text`), `is_active` (`bool`) | PK: `id`; Unique: `form_link` | Controla o banner da pesquisa no painel `/inicio`, a cor do indicador `.cpa-dot` e o link externo do Google Forms. |
| `roles` | `id` (`int8`), `role` (`text`) | PK: `id`; Unique: `role` | Define os **4 perfis oficiais**: `aluno`, `coordenador`, `avaliador_externo` e `admin` (sempre normalizar com `.trim().toLowerCase()`). |
| `profiles` | `user_id` (`uuid`), `email` (`text`), `nome` (`text`), `role` (`int8`) | PK/FK: `user_id` → `auth.users.id`; FK: `role` → `roles.id` | Estende o usuário do Supabase Auth com nome e cargo (`role` manipulável internamente pelo `admin`). |
| `areas` | `nome_area` (`text`) | PK: `nome_area` | Popula o dropdown de áreas responsáveis (`Coordenação`, `Infraestrutura`, `Reitoria`, `Secretaria`, `Secretaria de Coordenação`, `TI`). |
| `status_respostas` | `id` (`int8`), `status` (`text`), `hex` (`text`) | PK: `id` | Armazena as categorias únicas (`Resolvido`, `Inapto`, `Impertinente`) e suas cores hexadecimais para barras e etiquetas. |
| `respostas` | `id` (`int8`), `title` (`text`), `area` (`text`), `status` (`int8`), `ano` (`numeric`), `resposta` (`text`) | PK: `id`; FK: `area` → `areas.nome_area`; FK: `status` → `status_respostas.id` | Armazena as devolutivas publicadas pela CPA (`resposta` = texto da justificativa). |
| `dashboards_cpa` *(nova)* | `id` (`int8`), `slug` (`text`), `titulo` (`text`), `embed_url` (`text`), `embed_url_externo` (`text`, nullable), `ordem` (`int2`), `ativo` (`bool`) | PK: `id`; Unique: `slug` | Armazena os 4 relatórios do Data Studio (`presencial`, `ead`, `professores`, `tecnico_administrativo`), o link padrão (`@impacta`) e o link alternativo para `avaliador_externo` (MEC). |
| `relatorios` *(nova)* | `id` (`int8`), `titulo` (`text`), `tipo` (`text`), `ano` (`numeric`), `arquivo_url` (`text`), `created_at` (`timestamptz`) | PK: `id` | Cataloga os relatórios de autoavaliação e boletins informativos armazenados no Supabase Storage para download e upload administrativo. |

---

## 3. Autenticação, Sessão e Controle de Acesso (RBAC)

### 3.1 Clientes Supabase e Helpers (`src/lib/supabase/server.ts` e `src/lib/auth.ts`)
- `createClient()` (`src/lib/supabase/server.ts`): cria o cliente server-side usando `cookies()` do `next/headers`.
- `getUsuarioLogado()`: obtém `user` via `supabase.auth.getUser()`, consulta `prisma.profiles.findUnique({ where: { user_id: user.id }, include: { roles: true } })` e retorna `role` normalizado (`roles.role.trim().toLowerCase()`).
- `exigirUsuarioLogado()`: redireciona para `/login` se não houver sessão válida.
- `exigirAdmin()`: verifica se `usuario.role === "admin"`; caso contrário, executa `redirect("/inicio")`.

### 3.2 Fluxo de Login e Logout
- **Login (`/login` → `src/components/login-form.tsx` + `src/app/login/actions.ts`):**
  - Formulário ligado à Server Action `loginAction`, executando `supabase.auth.signInWithPassword({ email, password })`.
  - Valida existência do perfil em `profiles` e executa `redirect("/inicio")`.
- **Logout (`/inicio` → `src/components/home-header.tsx`):**
  - Botão de saída (`Undo2` com `.cpa-logout`) dentro de `<form action={logoutAction}>` executando `supabase.auth.signOut()` e redirecionando para `/login`.

### 3.3 Matriz de Permissões e Proteção de Rotas
- **Autenticação obrigatória:** Todo acesso a `/inicio`, `/devolutivas`, `/resultados`, `/relatorios`, `/devolutivas/responder` e `/perfis` exige usuário autenticado (caso contrário, redireciona para `/login`). Usuário logado acessando `/` ou `/login` redireciona para `/inicio`.
- **Regras por Perfil (`roles.role`):**
  - **`aluno`:** acessa `/inicio`, `/devolutivas`, `/relatorios` (download) e `/resultados` (visualiza apenas **Alunos do Presencial** e **Alunos do EAD**).
  - **`coordenador`:** acessa `/inicio`, `/devolutivas`, `/relatorios` (download) e `/resultados` (visualiza todos os 4 dashboards: **Alunos do Presencial**, **Alunos do EAD**, **Professores** e **Corpo Técnico Administrativo**).
  - **`avaliador_externo`:** acesso total de leitura a `/inicio`, `/devolutivas`, `/relatorios` (download) e `/resultados` (todos os 4 dashboards, utilizando `embed_url_externo` quando disponível para acesso sem e-mail `@impacta`).
  - **`admin` (CPA):** acesso total a todas as telas + permissões administrativas exclusivas:
    - Publicar devolutivas em `/devolutivas/responder`.
    - Fazer upload de relatórios e boletins em `/relatorios`.
    - Manipular cargos (`roles`) dos usuários em `/perfis`.
  - Qualquer tentativa de perfil não-`admin` acessar `/devolutivas/responder` ou `/perfis` pela URL redireciona para `/inicio`.

---

## 4. Implementação Lógica por Tela

### 4.1 Painel Principal (`/inicio`)
- **Busca de Dados (`src/app/inicio/page.tsx`):**
  - Obtém `usuario = await exigirUsuarioLogado()` e busca a pesquisa mais recente: `prisma.cpas.findFirst({ orderBy: [{ ano: "desc" }, { semestre: "desc" }] })`.
- **Cabeçalho (`HomeHeader`):**
  - Exibe `"Seja bem vindo, {usuario.nome}!"` e o cargo ativo (`usuario.role`).
  - O botão `i` abre o modal de **Contato e Informações da CPA**, contendo explicação sobre a CPA e links externos diretos para **Google Chats** e **Google Meet**.
- **Bloco Central (`StatusPesquisa`):**
  - Exibe `cpa.title` e altera a cor de `.cpa-dot` conforme `cpa.is_active` (verde `#6df24a` se `true`, vermelho `#f20000` se `false`).
  - Botão **Acessar** aponta para `cpa.form_link` (`target="_blank"`), desabilitado se `cpa.is_active === false`.
  - Botões **Devolutivas** (`/devolutivas`), **Resultados** (`/resultados`) e **Relatórios** (`/relatorios`) visíveis para **todos os perfis**.
  - Botões **Responder Devolutiva** (`/devolutivas/responder`) e **Gerenciar Perfis** (`/perfis`) renderizados **apenas** quando `usuario.role === "admin"`.

### 4.2 Central de Devolutivas (`/devolutivas`) e Modais
- **Interface sem Busca:** O campo `#busca-devolutivas` foi removido do escopo.
- **Carregamento (`src/app/devolutivas/page.tsx`):**
  - Consulta `status_respostas` (`orderBy: { id: "asc" }`) e `respostas` (`include: { status_respostas: true }`, `orderBy: { id: "desc" }`).
  - Agrupa os registros por `ano` (decrescente) e calcula as contagens para `GraficoStatus`.
- **Mural e Resposta (`MuralDialog` + `RespostaDialog`):**
  - Exibe todas as devolutivas do `ano` selecionado com rolagem vertical real (`overflow-y: auto`), permitindo alternar o item em destaque e abrir a justificativa completa (`area`, `status`, `resposta`) no `RespostaDialog`.

### 4.3 Resultados da Pesquisa CPA (`/resultados`)
- **Agrupamento por Público/Pesquisa (`dashboards_cpa`):**
  - Como os relatórios do Data Studio já contêm filtros internos de `ANO`, `Semestre`, `Ciclo` e botão próprio de `Download`, cada acordeão (`CartaoCpa`) representa **um público da CPA** (`presencial`, `ead`, `professores`, `tecnico_administrativo`).
  - O servidor filtra os registros de `dashboards_cpa` conforme o `usuario.role` (`aluno` recebe apenas `presencial` e `ead`; `coordenador`, `avaliador_externo` e `admin` recebem os 4).
- **Renderização do Embed (`<iframe>`):**
  - Substitui `GraficoPizza` e `ul.cpa-lines` pelo `<iframe>` oficial do Data Studio (`width="100%"`, `height="1600"`) dentro de container rolável, exibindo um aviso discreto para que o usuário esteja logado no navegador com sua conta Google `@impacta` (ou utilizando `embed_url_externo` para `avaliador_externo`).

### 4.4 Relatórios e Boletins (`/relatorios`)
- **Leitura e Download (Todos os perfis):**
  - Consulta `prisma.relatorios.findMany({ orderBy: [{ ano: "desc" }, { id: "desc" }] })` e exibe os documentos categorizados entre **Relatórios de Autoavaliação** e **Boletins Informativos** com link direto de download do Supabase Storage.
- **Upload Administrativo (`admin`):**
  - Exibe formulário no topo/modal da página apenas para `admin`, enviando o PDF ao bucket do Supabase Storage via Server Action/Route Handler e gravando os metadados na tabela `relatorios`.

### 4.5 Responder Devolutiva (`/devolutivas/responder` — Restrita a `admin`)
- Valida `await exigirAdmin()`.
- Carrega `areas` e `status_respostas` do banco para preencher os `<select>`.
- Submete via Server Action `criarDevolutivaAction` gravando `title`, `area`, `status`, `ano = new Date().getFullYear()` e `resposta` em `respostas`, executando `revalidatePath("/devolutivas")`.

### 4.6 Gerenciar Perfis e Cargos (`/perfis` — Restrita a `admin`)
- Valida `await exigirAdmin()`.
- Lista todos os usuários cadastrados em `profiles` (com `nome`, `email` e `role` atual) e permite ao administrador alterar o cargo (`aluno`, `coordenador`, `avaliador_externo`, `admin`) via Server Action (`prisma.profiles.update`), executando `revalidatePath("/perfis")`.

---

## 5. Restrições e Protocolo de Manutenção

1. **Preservação Visual:** Toda geometria utiliza `box()`, `size()`, `band()` e `u()` (`src/lib/cpa-box.ts`), mantendo a aparência em `src/app/cpa.css` e `src/app/cpa-resposta.css`.
2. **Rota `/pesquisa`:** Redirecionar `/pesquisa` para `/inicio`, pois a pesquisa ativa é aberta externamente via `cpas.form_link`.
3. **Limpeza de Mocks:** Remover arquivos não utilizados (`src/lib/auth-mock.ts`, `src/lib/session.ts`, `src/lib/perfis.ts`, `src/components/devolutivas/etiqueta-status.tsx`, `src/lib/resultados-data.ts` após migração para `dashboards_cpa`).
4. **Protocolo de Registros:** Documentar cada etapa concluída em `docs/registros/NNNN-assunto.md` (próximo número livre: **0020**) e atualizar `docs/registros/INDEX.md`.

---

## 6. Ordem de Implementação (Próximos Chats)

1. **Fase 1 — Finalização do RBAC e Banco:** Cadastrar os 4 perfis em `roles` (`aluno`, `coordenador`, `avaliador_externo`, `admin`), criar as tabelas `dashboards_cpa` e `relatorios` no Supabase, rodar `db pull` + `generate` e atualizar `src/lib/auth.ts` e `proxy.ts`.
2. **Fase 2 — Painel `/inicio` e Modal de Contato (`i`):** Ligar `cpas` (`title`, `is_active`, `form_link`), configurar o modal de contato (Google Chats e Google Meet) no botão `i` e ajustar os botões do painel (liberando **Resultados** e **Relatórios** para todos e mantendo **Responder Devolutiva** e **Gerenciar Perfis** apenas para `admin`).
3. **Fase 3 — Resultados com Google Data Studio (`/resultados`):** Conectar `/resultados` à tabela `dashboards_cpa` com filtro por `role` e incorporar os 4 `<iframe>` oficiais.
4. **Fase 4 — Central de Devolutivas (`/devolutivas` e `/devolutivas/responder`):** Remover `#busca-devolutivas`, ligar leitura/gráficos/mural real ao Prisma e conectar o formulário de criação de devolutivas.
5. **Fase 5 — Relatórios (`/relatorios`), Gestão de Cargos (`/perfis`) e Responsividade:** Implementar upload/download de PDFs com Supabase Storage, criar a tela administrativa de troca de cargos e adicionar `@media` queries para dispositivos móveis.