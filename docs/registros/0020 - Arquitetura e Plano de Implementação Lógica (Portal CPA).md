# Registro nº 0020 — Arquitetura e Plano de Implementação Lógica (Portal CPA)

| Campo | Valor |
|---|---|
| **Número** | 0020 |
| **Data da alteração** | 17/11/2026 (America/Sao_Paulo) |
| **Tipo** | Consolidação definitiva (Arquitetura lógica, RBAC, banco de dados e roteiro de implementação) |
| **Substitui** | `019 - guia estrutural base.md` |
| **Estado do projeto** | Protótipo visual 100% finalizado; Prisma 7 + Supabase Auth conectados (`src/lib/prisma.ts`, `src/lib/supabase/server.ts`, `src/lib/auth.ts`, `src/middleware.ts`) |
| **Próximo registro livre** | **0021** |

---

## 1. Stack e Regras Estruturais

* **Framework:** Next.js 16 (App Router) + TypeScript (`next.config.ts` com `cacheComponents: false` para renderização dinâmica autenticada sem bloqueio de pré-renderização).
* **Estilização:** shadcn/ui + CSS puro (`src/app/cpa.css` e `src/app/cpa-resposta.css`) + helpers proporcionais (`src/lib/cpa-box.ts`). **Não utilizar classes utilitárias Tailwind para layout.**
* **Autenticação:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) com cookies HTTP-only e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, usado **exclusivamente** para login, logout e identificação do `user.id`.
* **ORM e Banco:** PostgreSQL no Supabase acessado **100% no servidor** via **Prisma 7** (`@prisma/client@7` + `@prisma/adapter-pg@7`), singleton em `src/lib/prisma.ts`.

### Regras Críticas do Prisma 7 + Supabase
1. **Schemas:** `prisma/schema.prisma` mapeia `schemas = ["public", "auth"]`. **Nunca apagar** os models do schema `auth` gerados pelo `db pull`, pois `public.profiles` possui chave estrangeira para `auth.users`.
2. **Conexões:**
   * `DATABASE_URL` (Transaction Pooler, porta `6543`, `?pgbouncer=true`) → usada em runtime pelo `PrismaPg` em `src/lib/prisma.ts`.
   * `DIRECT_URL` (Session Pooler, porta `5432`) → usada pela CLI via `prisma7.config.ts`.
3. **Evolução do Banco:** **Não usar** `prisma migrate dev` nem `prisma db push`. Toda alteração de tabela/coluna é executada no SQL Editor / Table Editor do Supabase, seguida de:
   ```bash
   npx prisma db pull --config prisma7.config.ts
   npx prisma generate --config prisma7.config.ts
   ```
4. **Segurança (RLS):** Manter o *Row Level Security* ativado nas tabelas do schema `public` sem políticas abertas (bloqueando consultas diretas pela chave pública no navegador enquanto o Prisma opera via pooler no servidor).
5. **Normalização e Serialização Server → Client:**
   * Sempre normalizar a string de perfil lida do banco com `.trim().toLowerCase()` para evitar erros por espaços acidentais (ex.: `"admin "`).
   * Converter campos `bigint` (`int8`) com `Number(valor)` e campos `Prisma.Decimal` (`numeric`) com `Number(valor)` antes de passá-los para Client Components.

---

## 2. Matriz de Perfis e Permissões (RBAC)

O portal opera com **4 perfis oficiais** na tabela `roles` (mantendo fallback compatível caso existam registros legados `user` → `aluno`):

| Perfil (`roles.role`) | Dashboards Visíveis em `/resultados` | Permissões e Rotas Liberadas |
|---|---|---|
| **`aluno`** | • Alunos do **Presencial**<br>• Alunos do **EAD** | • Responder pesquisa ativa (`/inicio` → Google Forms)<br>• Consultar `/devolutivas` e abrir modais Mural/Resposta<br>• Consultar os 2 dashboards de alunos em `/resultados`<br>• Visualizar e baixar PDFs em `/relatorios`<br>• Abrir modal de contato `"i"` (Google Chats / Google Meet) |
| **`coordenador`** | • Alunos do **Presencial**<br>• Alunos do **EAD**<br>• **Professores**<br>• **Corpo Técnico Administrativo** | • Mesmas ações de consulta do `aluno`<br>• Acesso completo aos **4 dashboards** institucionais em `/resultados` |
| **`avaliador_externo`** | • **Acesso total** (todos os 4 dashboards, usando `embed_url_externo` quando disponível) | • Acesso irrestrito de **leitura** a todos os 4 dashboards em `/resultados`, `/devolutivas`, `/relatorios` e modal `"i"` |
| **`admin`** *(CPA)* | • **Acesso total** (todos os 4 dashboards) | • **Manipular cargos (`roles`)** dos usuários em `/perfis`<br>• **Publicar devolutivas** em `/devolutivas/responder`<br>• **Fazer upload** de relatórios e boletins em `/relatorios`<br>• Todas as visualizações do portal |

---

## 3. Modelagem do Banco de Dados (`schema: public`)

### 3.1 Tabelas Existentes
| Tabela | Colunas Principais | Chaves / Observações |
|---|---|---|
| `cpas` | `id` (`int8`), `form_link` (`varchar`), `ano` (`numeric`), `semestre` (`int2`), `title` (`text`), `is_active` (`bool`) | PK: `id`; Unique: `form_link`. Controla banner, cor do `.cpa-dot` e link externo do Forms. |
| `roles` | `id` (`int8`), `role` (`text`) | PK: `id`; Unique: `role`. Cadastrar: `aluno`, `coordenador`, `avaliador_externo`, `admin`. |
| `profiles` | `user_id` (`uuid`), `email` (`text`), `nome` (`text`), `role` (`int8`) | PK/FK: `user_id` → `auth.users.id`; FK: `role` → `roles.id`. |
| `areas` | `nome_area` (`text`) | PK: `nome_area` (`Coordenação`, `Infraestrutura`, `Reitoria`, `Secretaria`, `Secretaria de Coordenação`, `TI`). |
| `status_respostas` | `id` (`int8`), `status` (`text`), `hex` (`text`) | PK: `id` (`Resolvido` `#0ee80e`, `Inapto` `#f3ef00`, `Impertinente` `#f20000`). |
| `respostas` | `id` (`int8`), `title` (`text`), `area` (`text`), `status` (`int8`), `ano` (`numeric`), `resposta` (`text`) | PK: `id`; FK: `area` → `areas.nome_area`; FK: `status` → `status_respostas.id`. |

### 3.2 Novas Tabelas a Criar no Supabase (Antes das Fases 4 e 5)
1. **`dashboards_cpa` (para `/resultados`):**
   * `id` (`int8`, PK, identity)
   * `slug` (`text`, unique — ex.: `'presencial'`, `'ead'`, `'professores'`, `'tecnico'`)
   * `titulo` (`text` — ex.: `'Alunos do Presencial'`)
   * `publico` (`text` — descrição do público avaliado)
   * `embed_url` (`text` — URL de incorporação do Google Data Studio / Looker Studio)
   * `embed_url_externo` (`text`, nullable — URL alternativa compartilhada para `avaliador_externo`)
   * `roles_permitidas` (`text[]` — ex.: `{'aluno','coordenador','avaliador_externo','admin'}`)
   * `ordem` (`int2`)
   * `ativo` (`bool`, default `true`)
2. **`relatorios` + Bucket `relatorios-cpa` no Supabase Storage (para `/relatorios`):**
   * `id` (`int8`, PK, identity)
   * `titulo` (`text`)
   * `tipo` (`text` — `'Relatório de Autoavaliação'` ou `'Boletim Informativo'`)
   * `ano` (`numeric`)
   * `arquivo_url` (`text` — URL pública ou assinada do arquivo PDF no Storage)
   * `created_at` (`timestamptz`, default `now()`)

---

## 4. Regras de Implementação por Módulo

### 4.1 Autenticação e Proteção de Rotas (`src/lib/auth.ts` e `src/middleware.ts`)
* `src/middleware.ts` (executado como `proxy.ts` no Next.js 16): redireciona visitantes não autenticados para `/login` e usuários já autenticados de `/` ou `/login` para `/inicio`.
* `getUsuarioLogado()` em `src/lib/auth.ts`: consulta `supabase.auth.getUser()`, busca `profiles` + `roles` via Prisma e normaliza `role` para o tipo `PerfilCpa` (`"aluno" | "coordenador" | "avaliador_externo" | "admin"`).
* Guards de servidor:
  * `exigirUsuarioLogado()`: usado em `/inicio`, `/devolutivas`, `/resultados` e `/relatorios`.
  * `exigirAdmin()`: usado em `/devolutivas/responder`, `/perfis` e nas Server Actions administrativas (`criarDevolutivaAction`, `uploadRelatorioAction`, `atualizarRoleUsuarioAction`). Se não for `admin`, executa `redirect("/inicio")`.

### 4.2 Painel Principal (`/inicio` — `src/app/inicio/page.tsx`)
* Consulta `usuario = await exigirUsuarioLogado()` e `cpa = await prisma.cpas.findFirst({ orderBy: [{ ano: "desc" }, { semestre: "desc" }] })`.
* Passa `nome={usuario.nome}`, `role={usuario.role}` e `logoutAction={logoutAction}` para `HomeHeader`.
* Passa `titulo={cpa.title}`, `isActive={cpa.is_active}`, `formLink={cpa.form_link}` e `role={usuario.role}` para `StatusPesquisa`.

### 4.3 Central de Devolutivas (`/devolutivas` e `/devolutivas/responder`)
* **`/devolutivas` (`src/app/devolutivas/page.tsx`):** busca `status_respostas` e `respostas` (`orderBy: { id: "desc" }`), agrupa por `ano` (decrescente) para os cartões `CartaoAno` e passa apenas as devolutivas do respectivo ano para cada `MuralDialog`.
* **`/devolutivas/responder` (`src/app/devolutivas/responder/page.tsx`):** protegida com `await exigirAdmin()`, carrega `areas` e `status_respostas` do banco para `FormResposta` e grava novas devolutivas via Server Action `criarDevolutivaAction` (`ano = new Date().getFullYear()`), executando `revalidatePath("/devolutivas")`.

### 4.4 Resultados via Google Data Studio (`/resultados` — `src/app/resultados/page.tsx`)
* Protegida com `await exigirUsuarioLogado()`.
* Consulta `dashboards_cpa` (`where: { ativo: true }`, `orderBy: { ordem: "asc" }`) e filtra no servidor apenas os registros em que `roles_permitidas` inclui `usuario.role`.
* Se `usuario.role === "avaliador_externo"` e `embed_url_externo` estiver preenchido, utiliza essa URL; caso contrário, utiliza `embed_url`.
* Os filtros de `ANO`, `Semestre`, `Ciclo` e exportação `Download` são operados diretamente dentro do `<iframe>` do Looker Studio.

### 4.5 Repositório de Relatórios e Boletins (`/relatorios` — `src/app/relatorios/page.tsx`)
* Protegida com `await exigirUsuarioLogado()`.
* Lista todos os registros de `relatorios` (`orderBy: [{ ano: "desc" }, { id: "desc" }]`) para consulta e download por todos os perfis.
* Exibe o formulário superior de upload apenas quando `isAdmin = usuario.role === "admin"`, enviando o arquivo PDF para o bucket `relatorios-cpa` no Supabase Storage (via client server-side ou service key no servidor) e salvando os metadados na tabela `relatorios` via Prisma.

### 4.6 Gestão Interna de Perfis (`/perfis` — `src/app/perfis/page.tsx`)
* Protegida com `await exigirAdmin()`.
* Lista `profiles` (`include: { roles: true }`, `orderBy: { nome: "asc" }`) em `TabelaPerfis`.
* Ao clicar em **Salvar**, aciona a Server Action `atualizarRoleUsuarioAction(userId, novoRole)`, que valida `exigirAdmin()`, impede que o próprio administrador remova seu último acesso `admin` acidentalmente, atualiza `profiles.role` via Prisma e executa `revalidatePath("/perfis")`.

---

## 5. Roteiro Sequencial de Implementação

1. **Fase 1 (Atualização RBAC para 4 Perfis):**
   * Atualizar os registros da tabela `roles` no Supabase (`aluno`, `coordenador`, `avaliador_externo`, `admin`) e ajustar `src/lib/auth.ts` para retornar `PerfilCpa`.
2. **Fase 2 (Conexão Real de `/inicio`):**
   * Conectar `src/app/inicio/page.tsx` ao Prisma (`cpas`) e `getUsuarioLogado()`, ligando `logoutAction`, `cpa.is_active`, `cpa.form_link` e a exibição condicional de 4 vs. 6 botões.
3. **Fase 3 (Conexão Real de `/devolutivas` e `/devolutivas/responder`):**
   * Ligar leitura de `respostas` + `status_respostas` em `/devolutivas` (filtrando por ano no `MuralDialog`) e criação via `criarDevolutivaAction` em `/devolutivas/responder`.
4. **Fase 4 (Embeds do Google Data Studio em `/resultados`):**
   * Criar a tabela `dashboards_cpa` no Supabase, sincronizar Prisma (`db pull` + `generate`), cadastrar os 4 links oficiais do Data Studio e ligar `src/app/resultados/page.tsx` com filtro por perfil.
5. **Fase 5 (Relatórios com Storage em `/relatorios` e Gestão RBAC em `/perfis`):**
   * Criar a tabela `relatorios` + bucket `relatorios-cpa` no Supabase, conectar upload/download em `/relatorios` e ligar `TabelaPerfis` em `/perfis` à Server Action de atualização de cargo.