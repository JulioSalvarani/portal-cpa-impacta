# Portal CPA — Comissão Própria de Avaliação

Plataforma web institucional desenvolvida para a **Comissão Própria de Avaliação (CPA)** da **Faculdade Impacta**. O sistema centraliza a divulgação das pesquisas anuais de autoavaliação, o mural de devolutivas por segmento, a visualização de painéis analíticos do Google Looker Studio, o repositório de relatórios oficiais e a gestão administrativa de usuários e pesquisas.

---

## Stack Tecnológica

* **Framework:** Next.js 16 (App Router) + TypeScript
* **Banco de Dados & ORM:** PostgreSQL (Supabase) + Prisma 7 (`@prisma/adapter-pg`)
* **Autenticação & Storage:** Supabase Auth (cookies HTTP-only via `@supabase/ssr`) e Supabase Storage (bucket `relatorios-cpa`)
* **Interface & Estilização:** Tailwind CSS v4, componentes base shadcn/ui (Radix UI), ícones Lucide React e sistema de layout proporcional próprio (`cpa.css`, `cpa-resposta.css` e `src/lib/cpa-box.ts`) com adaptação responsiva para dispositivos móveis
* **Business Intelligence:** Incorporação via `<iframe>` dos dashboards oficiais do **Google Looker Studio / Data Studio**

---

## Perfis de Acesso (RBAC)

O controle de acesso é gerenciado pelas tabelas `roles` e `profiles` no Supabase e aplicado tanto no `src/middleware.ts` quanto nas Server Actions e Server Components:

| ID | Perfil (`roles.role`) | Tela Inicial (`/inicio`) | Resultados (`/resultados`) | Devolutivas (`/devolutivas`) | Relatórios (`/relatorios`) | Gestão Administrativa |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `aluno` | 4 botões (com link da CPA ativa) | *Aluno(a) Presencial* e *Aluno(a) EAD* | Somente destino **Alunos** | Consulta e download | — |
| **2** | `professor` | 4 botões (com link da CPA ativa) | Painéis docentes liberados | Somente destino **Professores** | Consulta e download | — |
| **3** | `coordenador` | 4 botões (com link da CPA ativa) | Todos os **4 painéis** | **Todas** (com tags `aluno`, `prof`, `func`) | Consulta, download, **upload e exclusão** | — |
| **4** | `avaliador_externo` | 3 botões + banner *"SEJA BEM VINDO"* (`#012a55`) | Todos os **4 painéis** (prioriza `embed_url_externo`) | **Todas** (com tags `aluno`, `prof`, `func`) | Consulta e download | — |
| **5** | `admin` | 6 botões (inclui **CPAs** e **Perfis**) | Todos os **4 painéis** | **Todas** + criar, editar e excluir | Consulta, download, **upload e exclusão** | `/cpas`, `/perfis` e `/devolutivas/responder` |

> **Regra de e-mail institucional:** Contas dos perfis internos (`aluno`, `professor`, `coordenador` e `admin`) exigem endereço de e-mail contendo `impacta`. Apenas o perfil `avaliador_externo` (MEC) permite o cadastro de e-mails externos.

---

## Módulos e Rotas do Sistema

* **`/login`**: Autenticação via Supabase Auth com fundo institucional (`/wallpaper.png`).
* **`/inicio`**: Painel principal com saudação, indicador do perfil ativo, modal de contato institucional (`i` com e-mail `cpa@impacta.edu.br`, **Google Chats** e **Google Meet**), banner de status da pesquisa vigente (verde = aberta / vermelho = encerrada) e atalhos de navegação por cargo.
* **`/devolutivas` e `/devolutivas/responder`**: Histórico agrupado por ano com gráfico resumo por status (*Resolvido*, *Inapto*, *Impertinente*), mural rolável e modal de justificativa. Administradores podem criar, editar e excluir devolutivas segmentadas por público.
* **`/resultados`**: Acordeões interativos por segmento (*Aluno(a) Presencial*, *Aluno(a) EAD*, *Professores* e *Corpo Técnico Administrativo*) incorporando os relatórios do Google Looker Studio.
* **`/relatorios`**: Repositório filtrável (*Todos*, *Relatório de Autoavaliação* e *Boletim Informativo*) com download de PDFs para toda a comunidade e upload/exclusão para `admin` e `coordenador`.
* **`/cpas`** *(Admin)*: Cadastro, ativação/encerramento e exclusão de pesquisas anuais (intervalo de `2003` até o ano corrente), garantindo **1 pesquisa ativa por perfil** via transação no banco.
* **`/perfis`** *(Admin)*: Criação de usuários no Supabase Auth + `profiles`, alteração de nome/cargo e revogação de acesso.
* **`/pesquisa`**: Redireciona automaticamente para `/inicio` (as respostas são coletadas via link externo do Google Forms configurado em `/cpas`).

---

## Estrutura do Projeto

```text
portal-cpa/
├── prisma/
│   └── schema.prisma              # Schema sincronizado via prisma db pull
├── prisma.config.ts               # Configuração do Prisma 7 (DIRECT_URL)
├── public/
│   └── wallpaper.png              # Imagem de fundo da tela de login
├── src/
│   ├── app/
│   │   ├── actions/               # Server Actions (auth, cpas, devolutivas, perfis, relatorios)
│   │   ├── cpas/                  # Gestão de pesquisas anuais (admin)
│   │   ├── devolutivas/           # Mural anual e formulário /responder
│   │   ├── inicio/                # Painel inicial por perfil
│   │   ├── login/                 # Tela de autenticação
│   │   ├── perfis/                # Gestão de usuários e cargos (admin)
│   │   ├── pesquisa/              # Redirect para /inicio
│   │   ├── relatorios/            # Repositório de relatórios e boletins PDF
│   │   ├── resultados/            # Dashboards Google Looker Studio
│   │   ├── cpa.css                # Sistema visual proporcional (--u) e media queries mobile
│   │   ├── cpa-resposta.css       # Estilos dedicados aos modais de devolutivas
│   │   └── globals.css            # Base Tailwind CSS v4 e tokens shadcn/ui
│   ├── components/
│   │   ├── cpas/                  # PainelCpas
│   │   ├── devolutivas/           # PainelDevolutivas, CartaoAno, GraficoStatus, MuralDialog, RespostaDialog, FormResposta
│   │   ├── perfis/                # TabelaPerfis
│   │   ├── relatorios/            # PainelRelatorios
│   │   ├── resultados/            # CartaoCpa
│   │   ├── ui/                    # Componentes base shadcn/ui
│   │   ├── barra-institucional.tsx
│   │   ├── contato-info-dialog.tsx
│   │   ├── home-header.tsx
│   │   ├── login-form.tsx
│   │   └── status-pesquisa.tsx
│   ├── lib/
│   │   ├── supabase/              # Clients server, browser e admin (service role)
│   │   ├── auth.ts                # Helpers de sessão e guardas RBAC
│   │   ├── cpa-box.ts             # Helpers de geometria proporcional (u, box, size, band)
│   │   └── prisma.ts              # Singleton PrismaClient com adapter-pg
│   └── middleware.ts              # Proteção de sessão e redirecionamento de rotas
└── package.json
```

---

## Como Executar Localmente

### 1. Pré-requisitos
* **Node.js** 22 LTS ou superior
* Projeto configurado no **Supabase** (PostgreSQL + Auth + bucket público `relatorios-cpa`)

### 2. Instalação
```bash
git clone https://github.com/JulioSalvarani/portal-cpa.git
cd portal-cpa
npm ci
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as credenciais do seu projeto Supabase:
> **POR CONTA DO SUPABASE NÃO PERMITIR A EXPOSIÇÃO DE CHAVES APAGUE O " [APAGAR] " NO MEIO DA CHAVE, ESPAÇOS INCLUSOS**
```env
# Conexão Postgres via shared transaction-mode pooler (apenas IPv4)
DATABASE_URL="postgresql://postgres.haievsaqclklgrujgskf:Gelado-2505@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexão Postgres via shared session-mode pooler (usado para migrações)
DIRECT_URL="postgresql://postgres.haievsaqclklgrujgskf:Gelado-2505@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# URL do projeto (Supabase > Project Settings > API > Project URL)
NEXT_PUBLIC_SUPABASE_URL="https://haievsaqclklgrujgskf.supabase.co"

# Chave pública do cliente (Supabase > Project Settings > API Keys > Publishable key)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_HpIf-D-BmTb5yCGEfNuYVg_jw_h8IU1"

# Chave secreta de administração — NUNCA preencher com o valor real neste arquivo
SUPABASE_SERVICE_ROLE_KEY="sb_secret_lT [APAGAR] iCsj80DQh3wWmf1sGJoQ_joWqv2qm"
```

> **Importante:** Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente nem envie arquivos `.env*` para o repositório. Apenas está exposto aqui pois é um server feito para teste.

### 4. Gerar o Cliente Prisma e Iniciar
```bash
npx prisma db pull
npx prisma generate
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

---

## Regras de Banco de Dados e Deploy

* **Sincronização do Prisma:** O banco de dados é gerenciado diretamente no Supabase (SQL Editor / Table Editor) com **RLS habilitado** nas tabelas do schema `public`. Caso altere alguma tabela no Supabase, atualize o schema local executando:
  ```bash
  npx prisma db pull
  npx prisma generate
  ```
  *(Não utilize `prisma migrate dev` ou `prisma db push` neste projeto).*
* **Upload de Relatórios (Vercel):** Para compatibilidade com o limite de payload *serverless* da Vercel (4,5 MB), os arquivos enviados em `/relatorios` devem estar em formato **PDF** com tamanho máximo de **4 MB**.
* **Visualização dos Dashboards:** Os painéis padrão em `/resultados` exigem que o usuário esteja conectado no navegador com uma conta Google institucional `@impacta`. Perfis `avaliador_externo` utilizam os links configurados em `dashboards_cpa.embed_url_externo`.

### 5. [PROCESSO OPCIONAL] Deploy e Conexão com o Banco (Exemplo: Vercel)

> **Nota:** A hospedagem na **Vercel** descrita abaixo é **apenas uma opção sugerida** de deploy. A escolha da plataforma ou infraestrutura de publicação (como Vercel, Railway, Render, AWS, servidor próprio com Docker, entre outras) fica totalmente a critério do criador ou responsável pela aplicação.

Caso opte por publicar o projeto na **Vercel** conectando-o ao banco de dados no **Supabase**:

1. **Importação do repositório:** acesse [vercel.com/new](https://vercel.com/new), importe o repositório do projeto no GitHub (necessário ter acesso a conta do repositório que é importado) e **ignore integrações opcionais** de banco (como *Prisma Postgres* ou a integração automática do *Supabase*), evitando conflitos com as strings de conexão já configuradas.
2. **Configuração das variáveis de ambiente:** antes de clicar em **Deploy**, cadastre as **5 variáveis de ambiente** no painel do projeto na Vercel (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`), garantindo que `DATABASE_URL` aponte para o *Transaction Pooler* (porta **6543** com `?pgbouncer=true`) e `DIRECT_URL` para o *Session Pooler* (porta **5432**).
3. **URLs de autenticação no Supabase:** após a publicação e a obtenção da URL final (ou apontamento de domínio próprio), acesse **Supabase → Authentication → URL Configuration** e atualize os campos **Site URL** e **Redirect URLs** com o endereço de produção.

## Testes do banco de dados
* **Usuários genéricos já criados no banco para realização de testes**
```
Aluno (role: 1): aluno.teste@aluno.impacta.edu.br | Senha: Teste@1234

Professor (role: 2): professor.teste@impacta.edu.br | Senha: Teste@1234

Coordenador (role: 3): coordenador.teste@impacta.edu.br | Senha: Teste@1234

Avaliador Externo (role: 4): avaliador.teste@mec.gov.br | Senha: Teste@1234

Admin (role: 5): admin.teste@impacta.edu.br | Senha: Teste@1234
```
## Regras de Banco de Dados e Deploy

* **Sincronização do Prisma:** O banco de dados é gerenciado diretamente no Supabase (SQL Editor / Table Editor) com **RLS habilitado** nas tabelas do schema `public`. Caso altere alguma tabela no Supabase, atualize o schema local executando:

  ```bash
  npx prisma db pull
  npx prisma generate
  ```

  *(Não utilize `prisma migrate dev` ou `prisma db push` neste projeto).*

* **Upload de Relatórios (Vercel):** Caso utilize funções *serverless* da Vercel, respeite o limite de payload de 4,5 MB mantendo os arquivos enviados em `/relatorios` no formato **PDF** com tamanho máximo de **4 MB**.
* **Visualização dos Dashboards:** Os painéis padrão em `/resultados` exigem que o usuário esteja conectado no navegador com uma conta Google institucional `@impacta`. Perfis `avaliador_externo` utilizam os links configurados em `dashboards_cpa.embed_url_externo`.

---

## Documentação e Guias de Uso

Os manuais operacionais por perfil de usuário estão disponíveis na documentação do projeto:

* `guia-comunidade-academica.md` — Roteiro para Alunos e Professores
* `guia-coordenacao.md` — Roteiro para Coordenação de Curso
* `guia-avaliador-externo.md` — Roteiro para Avaliador Externo (MEC)
* `manual-administrador-cpa.md` — Manual completo de administração do portal
* `guia-visual-e-arquitetura-de-componentes` - Guia para entendimento e modificação de elementos visuais
* `arquitetura-e-plano-de-implementacao-logica` - Arquitetura de processos lógicos de chamadas de banco de dados e manipulação de backend 