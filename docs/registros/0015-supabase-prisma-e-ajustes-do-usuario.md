# Registro nº 0015 — Supabase + Prisma 7 e ajustes feitos pelo usuário

| Campo | Valor |
|---|---|
| **Número** | 0015 |
| **Data da alteração** | 15/11/2026, 23:50 (America/Sao_Paulo) |
| **Tipo** | Atualização (alterações **feitas pelo usuário** no projeto real, registradas pelo assistente) |
| **Origem** | Mensagem do usuário de 15/11/2026, com o PDF "Resolvendo Prisma 7 e Supabase" (log de conversa com outra IA) e 3 imagens (diagrama do banco, modal, dropdown de áreas) |
| **Relacionados** | 0011 (modal), 0012 (responder devolutiva), 0014 (contexto do projeto) |

> **Segurança:** o PDF do log contém a **senha do banco em texto** e o endereço completo do projeto Supabase. Elas **não foram copiadas** para este registro. Recomenda-se **redefinir a senha** (Supabase → Project Settings → Database → Reset database password), usando só letras e números, e conferir que `.env` e `.env.local` estão no `.gitignore` e fora de qualquer repositório ou conversa.

---

## 1. Resumo das alterações do usuário

| # | Alteração | Onde |
|---|---|---|
| 1 | Modal do Mural centralizado com `className="cpa-modal translate-x-0 translate-y-0"` | `src/components/devolutivas/mural-dialog.tsx` |
| 2 | Definidas as **áreas responsáveis reais** | `src/components/devolutivas/form-resposta.tsx` (dropdown "Área responsável") |
| 3 | **Conexão com o Supabase (PostgreSQL) via Prisma 7** e `PrismaClient` com adaptador `pg` | `prisma/`, arquivo de configuração do Prisma, `src/lib/prisma.ts` (nomes conforme o log; ver seção 3) |
| 4 | Banco do Supabase criado e **puxado** com `npx prisma db pull` | tabelas na seção 4 |

O assistente aplicou as alterações 1 e 2 também na cópia de trabalho dele, para que os próximos arquivos enviados não desfaçam o que o usuário fez (seção 7).

## 2. Modal do Mural centralizado

- Mudança: `<DialogContent className="cpa-modal translate-x-0 translate-y-0">`.
- Motivo: o `DialogContent` do shadcn (preset Vega, Tailwind v4) centraliza com `top-1/2 left-1/2` + `-translate-x-1/2 -translate-y-1/2`, que usa a propriedade CSS `translate`. `translate-x-0 translate-y-0` zera esse deslocamento, e o `cpa.css` centraliza com `inset: 0; margin: auto` (registro 0011). Sem isso o modal ficava deslocado e saía da área interagível.
- Resultado (imagem enviada): modal 662 × 370u centralizado sobre a Central de Devolutivas, com título "Mural de Devolutivas", manifestação em destaque e duas recolhidas com etiquetas Não Procede / Pedido em Análise / Concluído.
- Observação visual: o botão de fechar (X) do shadcn aparece como um círculo branco no canto superior esquerdo do modal, parcialmente fora da borda. Não está no mockup; pode ser reposicionado depois (ainda não foi pedido).

## 3. Áreas responsáveis reais

Lista definida pelo usuário (ordem da imagem do dropdown), em `form-resposta.tsx`:

1. Coordenação
2. Infraestrutura
3. Reitoria
4. Secretaria
5. Secretaria de Coordenação
6. TI

Isso **substitui** a lista de exemplo do registro 0012 (Secretaria Acadêmica, Coordenação de Curso, Infraestrutura e Manutenção, Biblioteca, Financeiro, Tecnologia da Informação, Direção). A tabela `areas` do banco (seção 4) é a fonte natural dessas opções: quando a tela for ligada ao banco, o dropdown deve ler `areas.nome_area` em vez de uma constante.

## 4. Banco de dados (Supabase / PostgreSQL)

Fonte: diagrama enviado pelo usuário. **A fonte autoritativa é o `prisma/schema.prisma` gerado pelo `db pull`**, que o assistente ainda não viu; os tipos abaixo são os exibidos no diagrama.

| Tabela | Coluna | Tipo (diagrama) | Observações vistas no diagrama |
|---|---|---|---|
| `cpas` | `id` | int8 | chave primária, identidade |
| | `form_link` | varchar | aparenta ser único |
| | `ano` | numeric | |
| | `semestre` | int2 | |
| | `title` | text | |
| | `is_active` | bool | |
| `profiles` | `user_id` | uuid | chave primária; **liga a `auth.users.id`** (Supabase Auth) |
| | `email` | text | aparenta ser único |
| | `nome` | text | |
| | `role` | int8 | **chave estrangeira para `roles.id`** |
| `roles` | `id` | int8 | chave primária |
| | `role` | text | aparenta ser único (nome do perfil) |
| `areas` | `nome_area` | text | chave primária |
| `respostas` | `area` | text | **chave estrangeira para `areas.nome_area`**; ícone de chave no diagrama |
| | `status` | text | |
| | `ano` | numeric | ícone de chave no diagrama |
| | `resposta` | text | |

**Relações:** `profiles.user_id → auth.users.id`; `profiles.role → roles.id`; `respostas.area → areas.nome_area`.

**Leitura provisória (a confirmar com o usuário):**
- `roles`/`profiles` sustentam o **controle de acesso por perfil** (aluno, coordenador, administrador, avaliador externo) em cima do **Supabase Auth**.
- `cpas` guarda cada pesquisa semestral (ano, semestre, título, se está ativa) e um **link de formulário** (`form_link`): a pesquisa pode ser um formulário externo, e não a página `/pesquisa`.
- `respostas` guarda as respostas dos administradores às devolutivas (área, status, ano, texto da resposta). **Não há tabela de manifestações** nem ligação de `respostas` com uma manifestação ou com uma `cpa`.

## 5. Integração Prisma 7 + Supabase

### 5.1 Comandos executados pelo usuário

```bash
npm install @prisma/client@7
npm install -D prisma@7
npx prisma --version                 # conferir a versão
npx prisma init
npm install @prisma/adapter-pg@7 pg dotenv
npm install -D @types/pg
npx prisma db pull                   # puxar o banco
npx prisma generate                  # gerar o client
```

Versão: o usuário informou "7.1"; o log mostra **Prisma CLI 7.10.1**. Confirmar com `npx prisma --version`.

### 5.2 Arquitetura final (conforme o log com a outra IA)

| Peça | Conteúdo |
|---|---|
| `.env` / `.env.local` | `DATABASE_URL` = Supabase **Transaction Pooler**, porta **6543**, com `?pgbouncer=true` (usada pela aplicação). `DIRECT_URL` = **Session Pooler** (ou conexão direta), porta **5432** (usada pela CLI do Prisma: `db pull`, `migrate`) |
| `prisma/schema.prisma` | `generator client { provider = "prisma-client"; output = "../src/generated/prisma" }` e `datasource db { provider = "postgresql"; schemas = ["public", "auth"] }`. **Sem** `url` e `directUrl` aqui |
| Arquivo de config do Prisma (log: `prisma7.config.ts`, na raiz) | `defineConfig({ schema: "prisma/schema.prisma", migrations: { path: "prisma/migrations" }, datasource: { url: env("DIRECT_URL") } })`, carregando `dotenv` com `.env.local` e `.env` |
| `src/lib/prisma.ts` | Singleton do `PrismaClient` com `new PrismaPg({ connectionString: process.env.DATABASE_URL! })` como `adapter`; reaproveitado em `globalThis` fora de produção (evita várias conexões no hot reload). Import do client: `@/generated/prisma/client` |

### 5.3 Erros encontrados e como foram resolvidos

| Erro | Causa | Solução |
|---|---|---|
| **P1012** "datasource property `url` is no longer supported in schema files" | O painel do Supabase mostra instruções do Prisma 6; no **Prisma 7** `url`/`directUrl` saíram do `schema.prisma` | Mover a URL para o arquivo de config do Prisma (`datasource.url = env("DIRECT_URL")`) e passar o **adapter** (`PrismaPg`) no `new PrismaClient({ adapter })` |
| **P1013** "invalid port number in database URL" | A senha continha `#`, que em URL marca o início de um fragmento e cortava o endereço | Trocar `#` por **`%23`** nas duas URLs (ou, melhor, redefinir a senha só com letras e números) |
| **P4002** "Cross schema references are only allowed when the target schema is listed in the schemas property" | `public.profiles` aponta para `auth.users` (schema `auth`); por padrão o Prisma só lê `public` | `schemas = ["public", "auth"]` no `datasource db`, depois `npx prisma db pull` e `npx prisma generate` |

### 5.4 Regras que decorrem disso (valem para as próximas conversas)

- **Não apagar** os models do schema `auth` gerados pelo `db pull`: o model `profiles` depende de `users`.
- **Não usar** `prisma migrate dev` nem `prisma db push` direto: o Prisma pode tentar alterar tabelas internas do Supabase (`auth`). Criar/alterar tabelas no **Supabase (painel / SQL Editor)** e depois rodar `npx prisma db pull` + `npx prisma generate`.
- No Prisma 7 o suporte a vários schemas é nativo (não precisa de `previewFeatures`).
- O Prisma 7 **não carrega `.env` sozinho** na CLI: por isso o `dotenv` no arquivo de config.
- Com `provider = "prisma-client"` e `output` definido, o client é gerado em `src/generated/prisma` (conferir se essa pasta deve entrar no `.gitignore` do projeto).
- O `PrismaClient` deve ser usado **somente no servidor** (server components, server actions, route handlers), nunca em componentes `"use client"`.

## 6. Impacto no que já está documentado

- **Autenticação (registro 0014, seção 10):** o caminho natural passa a ser o **Supabase Auth** + `profiles`/`roles`. Os arquivos `src/lib/auth-mock.ts`, `session.ts`, `perfis.ts` e `src/app/login/actions.ts` (esboço antigo, sem uso) ficam obsoletos nesse cenário.
- **Pesquisa:** `cpas.form_link` sugere que o preenchimento pode ser um formulário externo; isso muda o que `/pesquisa` precisa ser (ver pergunta 3 abaixo).
- **Devolutivas e Resultados:** as telas ainda usam dados de exemplo (`devolutivas-data.ts`, `resultados-data.ts`). O banco **ainda não tem estruturas** para as manifestações do Mural nem para as respostas da pesquisa (alternativas A–E e discursivas).
- **Responder devolutiva:** as categorias da tela (Resolvido, Inapto, Impertinente) provavelmente são o campo `respostas.status`; confirmar.

## 7. O que o assistente alterou nesta atualização

| Arquivo | Alteração |
|---|---|
| `src/components/devolutivas/mural-dialog.tsx` | Aplicado `cpa-modal translate-x-0 translate-y-0` (igual ao projeto do usuário) |
| `src/components/devolutivas/form-resposta.tsx` | Lista `AREAS` trocada pelas 6 áreas reais; comentário `TODO` para ler de `areas` |
| `docs/registros/0014-contexto-do-projeto.md` | Atualizado com banco/Prisma, áreas reais, modal e novas pendências (seção 13) |
| `docs/registros/INDEX.md`, `README.md` | Linha do registro 0015; data de atualização |

Nenhum arquivo do Prisma foi criado pelo assistente: o código de conexão está **só no projeto do usuário**. Se o assistente enviar novos zips, **não deve incluir** `package.json`, `prisma/`, `.env*` nem `src/lib/prisma.ts`.

## 8. Perguntas em aberto (para o usuário responder)

> **Atualização (registro 0016, 16/11/2026):** o usuário respondeu as perguntas 1 a 5; as respostas e as novas dúvidas estão em `0016-ver-resposta-titulo-e-decisoes.md`. Resumo: manifestações = última pergunta do Google Forms; chave composta de `respostas` será trocada por surrogate key; formulários no Google Forms (o portal só lê as respostas); contas vêm de um banco interno e as roles definem permissões (aluno não acessa Resultados nem Responder); categorias Inapto/Impertinente/Resolvido com etiquetas e cores vindas do banco; o nome `prisma7.config.ts` veio da inicialização, não de escolha do usuário.

1. **Manifestações do Mural:** onde ficará o texto de cada manifestação (e quem a enviou, a data e o ano)? Não há tabela para isso no diagrama. A tabela `respostas` é a resposta do administrador a uma manifestação? Se sim, falta a ligação (por exemplo `manifestacao_id`).
2. **Chave de `respostas`:** os ícones de chave em `area` e `ano` indicam chave primária composta (por exemplo `area + status + ano`)? Isso permitiria **uma única resposta** por combinação, o que parece restritivo. Qual é a chave real no `schema.prisma`?
3. **Pesquisa e Resultados:** o formulário é externo (`cpas.form_link`) ou será construído em `/pesquisa`? De onde virão os resultados (gráficos de alternativas e respostas discursivas): importados de um formulário externo ou guardados em novas tabelas?
4. **Perfis:** o conteúdo de `roles` (ids e nomes: aluno, coordenador, administrador, avaliador externo?) e como o usuário se cadastra: já existe tela/fluxo de criação de contas ou os usuários são criados no painel do Supabase?
5. **`status` de `respostas`:** quais valores existem (resolvido, inapto, impertinente? ou também em análise)? E como mapeiam para as etiquetas do Mural e para as barras Não Procedidas / Em Análise / Procedidas?
6. **Arquivo de config:** o log cita `prisma7.config.ts`; o nome padrão da CLI é `prisma.config.ts`. O arquivo foi renomeado de propósito?
