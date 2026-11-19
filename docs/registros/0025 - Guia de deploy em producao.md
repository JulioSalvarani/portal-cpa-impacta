# Registro nº 0025 — Guia Passo a Passo: Configuração de Produção e Deploy do Portal CPA

| Campo | Valor |
|---|---|
| **Número** | 0025 |
| **Data da alteração** | 18/11/2026 (America/Sao_Paulo); renumerado de 0023 para 0025 e atualizado em 19/11/2026 (reordenação de roles, permissões de relatórios e matriz pós-0024) |
| **Tipo** | Guia operacional (configuração de ambiente, ajustes pré-deploy, deploy na Vercel, validação pós-deploy) |
| **Complementa** | `0021 - Arquitetura e Plano de Implementação Lógica` (Seção 5, checklist), `0022 - Limpeza de código sem uso`, `0023 - Guia Técnico de Adaptações` (SQL de roles e Storage) e `0024 - Implementação das adaptações no código` |
| **Estado do projeto** | Código pronto; o arquivo do projeto vem **sem `node_modules`** e **sem `src/generated/prisma`** — ambos são recriados pelos comandos deste guia |
| **Próximo registro livre** | **0026** |

> **Como usar este guia:** siga as etapas **na ordem**. Cada etapa termina com um item **✅ Como saber que deu certo**. Se não bateu, não avance — vá para a Etapa 10 (Problemas comuns).

---

## Visão geral (o que vai acontecer)

1. Preparar o computador (Node.js, Git).
2. Descompactar o projeto e instalar dependências.
3. Fazer 3 ajustes no projeto (necessários para o deploy funcionar).
4. Configurar o arquivo de variáveis de ambiente.
5. Testar tudo no seu computador (build de produção).
6. Configurar o Supabase para produção (Auth, Storage, dados).
7. Subir o código para o GitHub.
8. Publicar na Vercel.
9. Apontar o domínio e finalizar o Supabase.
10. Testar em produção (checklist por perfil).

Tempo estimado: 1 a 2 horas na primeira vez.

---

## Etapa 1 — Preparar o computador

### 1.1 Instalar o Node.js
1. Acesse https://nodejs.org e baixe a versão **LTS** (22 ou superior).
2. Instale com as opções padrão.
3. Abra o **Terminal** (Windows: *PowerShell*; macOS/Linux: *Terminal*) e confira:
   ```bash
   node -v
   npm -v
   ```
✅ **Como saber que deu certo:** os dois comandos mostram um número de versão (ex.: `v22.x.x`).

### 1.2 Instalar o Git
1. Baixe em https://git-scm.com/downloads e instale com as opções padrão.
2. Confira:
   ```bash
   git --version
   ```
✅ Aparece uma versão do Git.

### 1.3 Criar as contas necessárias (se ainda não tiver)
- **GitHub** — https://github.com (guarda o código).
- **Vercel** — https://vercel.com (publica o site). Na criação, escolha **Continue with GitHub**.
- **Supabase** — o projeto do portal já existe; você só precisa ter acesso a ele.

---

## Etapa 2 — Descompactar o projeto e instalar dependências

1. Descompacte o projeto (ex.: `portal-cpa-limpo.zip`) em uma pasta sem acentos, por exemplo `C:\projetos\portal-cpa` ou `~/projetos/portal-cpa`.
2. Abra o terminal **dentro dessa pasta** (a que contém o `package.json`):
   ```bash
   cd caminho/para/portal-cpa
   ```
3. Instale as dependências (cria a pasta `node_modules`):
   ```bash
   npm ci
   ```
   > Use `npm ci` (e não `npm install`): ele instala exatamente as versões do `package-lock.json`.
4. Gere o cliente do Prisma (cria `src/generated/prisma`, que não vem no arquivo):
   ```bash
   npx prisma generate
   ```
   > Se este comando reclamar de "config" ou "datasource", faça primeiro a **Etapa 3.2** e a **Etapa 4**, e depois repita.

✅ **Como saber que deu certo:** `npm ci` termina sem `ERR!` e existe a pasta `src/generated/prisma`.

---

## Etapa 3 — Três ajustes no projeto (obrigatórios para o deploy)

Abra a pasta no seu editor (ex.: VS Code).

### 3.1 Gerar o Prisma automaticamente no servidor
O servidor da Vercel recebe o código **sem** `src/generated/prisma`. Precisamos que ele gere essa pasta sozinho.

1. Abra o `package.json`.
2. No bloco `"scripts"`, adicione a linha `postinstall`:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "eslint",
     "postinstall": "prisma generate"
   },
   ```
3. Salve.

✅ Sem esta linha, o build na Vercel falha com `Cannot find module '@/generated/prisma/client'`.

### 3.2 Renomear o arquivo de configuração do Prisma
A CLI do Prisma só reconhece automaticamente o nome `prisma.config.ts`. O arquivo atual se chama `prisma7.config.ts`.

1. Na raiz do projeto, renomeie:
   `prisma7.config.ts` → `prisma.config.ts`
2. Não é preciso alterar o conteúdo.

### 3.3 Verificar o aviso do `middleware` (Next 16)
O Next 16 passou a preferir o nome `proxy` no lugar de `middleware`. Você só precisa agir **se** o build (Etapa 5) mostrar um aviso/erro citando isso:

1. Renomeie `src/middleware.ts` → `src/proxy.ts`.
2. Dentro do arquivo, renomeie a função `export async function middleware(...)` para `export async function proxy(...)`.
3. Mantenha o bloco `export const config = { matcher: [...] }` igual.

> Se o build passar sem aviso, **não mexa** nesse arquivo.

---

## Etapa 4 — Configurar as variáveis de ambiente

As variáveis ficam em um arquivo chamado `.env.local` na raiz (esse arquivo **nunca** vai para o GitHub — o `.gitignore` já o protege).

1. Na raiz do projeto, crie (ou confira) o arquivo `.env.local` com estas 5 linhas:
   ```env
   DATABASE_URL=...
   DIRECT_URL=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Onde achar cada valor no painel do Supabase (https://supabase.com/dashboard → seu projeto):

| Variável | Onde encontrar | Observação |
|---|---|---|
| `DATABASE_URL` | **Connect** → *Transaction pooler* | Porta **6543**. Termine a URL com `?pgbouncer=true`. |
| `DIRECT_URL` | **Connect** → *Session pooler* | Porta **5432**. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API** → *Project URL* | Começa com `https://`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Project Settings → API Keys** → *Publishable key* | Pode ficar visível no navegador. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project Settings → API Keys** → *service_role* (secret) | **SECRETA.** Nunca coloque `NEXT_PUBLIC_` antes. Nunca compartilhe. |

3. Se a URL contiver `[YOUR-PASSWORD]`, substitua pela senha do banco (se esqueceu: **Project Settings → Database → Reset database password**).

✅ **Como saber que deu certo:** o arquivo tem 5 linhas, nenhuma com `...` ou `[YOUR-PASSWORD]` sobrando.

---

## Etapa 5 — Testar no seu computador (build de produção)

1. Recrie o Prisma (agora com o config renomeado):
   ```bash
   npx prisma generate
   ```
2. Compile como na produção:
   ```bash
   npm run build
   ```
3. Se compilou, inicie:
   ```bash
   npm start
   ```
4. Abra http://localhost:3000 no navegador.
5. Teste rapidamente:
   - Você é levado a `/login`.
   - Entra com um usuário existente e chega em `/inicio`.
   - O botão de sair volta ao `/login`.

Para parar o servidor: `Ctrl + C` no terminal.

✅ **Como saber que deu certo:** build termina com a tabela de rotas (`/inicio`, `/login`, `/cpas`…) sem erros em vermelho, e o login funciona.

> Se o build mostrar **aviso sobre `middleware`**, faça a Etapa 3.3 e rode `npm run build` de novo.

---

## Etapa 6 — Configurar o Supabase para produção

Acesse https://supabase.com/dashboard e abra o projeto do portal.

### 6.1 Confirmar o bucket de relatórios
1. Menu **Storage**.
2. Verifique se existe o bucket **`relatorios-cpa`** e se está marcado como **Public**.
   - Se não existir: **New bucket** → nome `relatorios-cpa` → ligue **Public bucket** → **Save**.

### 6.2 Criar as políticas de Storage (necessário para publicar PDFs)
O upload/exclusão de PDFs usa a sessão do usuário logado; sem política, dá erro de permissão. (A leitura/download já é pública pelo bucket público.)

1. Menu **SQL Editor** → **New query**.
2. Cole e execute (**Run**):
   ```sql
   -- Permite que usuários autenticados enviem PDFs ao bucket de relatórios
   create policy "relatorios-cpa: upload autenticado"
   on storage.objects for insert to authenticated
   with check (bucket_id = 'relatorios-cpa');

   -- Permite que usuários autenticados removam PDFs do bucket de relatórios
   create policy "relatorios-cpa: delete autenticado"
   on storage.objects for delete to authenticated
   using (bucket_id = 'relatorios-cpa');
   ```
3. Segurança: o sistema só permite upload/exclusão pelas Server Actions de relatórios, protegidas por `exigirGestorRelatorios()` (perfis `admin` e `coordenador`). **Para o `coordenador` conseguir publicar PDFs, aplique também as políticas da Seção 2.1 do Registro 0023** (função `private.is_coordenador()` e políticas `upload coordenador` / `delete coordenador`).

**Opcional — restringir também no banco apenas a `admin`** (camada extra). Execute em vez do bloco acima:
```sql
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role
    where p.user_id = auth.uid() and r.role = 'admin'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create policy "relatorios-cpa: upload admin"
on storage.objects for insert to authenticated
with check (bucket_id = 'relatorios-cpa' and private.is_admin());

create policy "relatorios-cpa: delete admin"
on storage.objects for delete to authenticated
using (bucket_id = 'relatorios-cpa' and private.is_admin());
```

✅ **Como saber que deu certo:** em **Storage → Policies**, as políticas aparecem sob `relatorios-cpa`/`storage.objects`.

### 6.3 Manter o RLS ligado
1. Menu **Table Editor** → para cada tabela (`cpas`, `roles`, `profiles`, `areas`, `status_respostas`, `respostas`, `dashboards_cpa`, `relatorios`), confirme que **RLS enabled** está ativo.
2. **Não crie** políticas abertas. O portal acessa o banco pelo servidor (Prisma), que não é afetado pelo RLS.

### 6.4 Garantir ao menos um administrador
1. Menu **Authentication → Users**: confirme que existe seu usuário.
2. Menu **Table Editor → `profiles`**: a linha do seu usuário deve ter `role` = `5` (admin).
   - Referência (`roles`, ordem oficial após o Registro 0023): `1 aluno`, `2 professor`, `3 coordenador`, `4 avaliador_externo` (com `cor_hex = #012a55`), `5 admin`.
   - Se o seu banco ainda estiver na ordem antiga, execute antes o SQL de migração da Seção 1.2 do Registro 0023.
3. Se não houver admin, edite o campo `role` da sua linha para `5`.

### 6.5 Limpar dados de teste (checklist 0021 — item 4)
Antes de liberar para o público:
1. **`relatorios`**: apague relatórios fictícios (e os PDFs de teste no Storage).
2. **`cpas`**: apague pesquisas de teste; deixe **apenas uma ativa** (`is_active = true`).
3. **`profiles`** (e **Authentication → Users**): remova usuários de homologação.
4. **`respostas`**: remova devolutivas de teste.
5. **`dashboards_cpa`**: confirme os 4 dashboards (`Aluno(a) Presencial`, `Aluno(a) EAD`, `Professores`, `Corpo Técnico Administrativo`) com `embed_url` oficial do Looker Studio, `embed_url_externo` preenchido (MEC), `perfis_permitidos` corretos e `ativo = true`.

> A URL de Site/redirecionamento do Auth será configurada na **Etapa 9**, quando você já tiver o domínio.

---

## Etapa 7 — Subir o código para o GitHub

### 7.1 Criar o repositório
1. Em https://github.com/new, crie um repositório (ex.: `portal-cpa`), marcado como **Private**.
2. **Não** marque "Add a README".

### 7.2 Enviar o código
No terminal, na pasta do projeto:
```bash
git init
git add .
git commit -m "Portal CPA - versão de produção"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portal-cpa.git
git push -u origin main
```
(substitua `SEU-USUARIO` pelo seu usuário do GitHub).

### 7.3 Conferir que segredos NÃO subiram
No GitHub, abra o repositório e verifique que **não existem** `.env`, `.env.local`, `node_modules` nem `src/generated`.
> Se `.env` aparecer lá, **pare**: apague-o do repositório e **gere novas chaves** no Supabase (a service_role foi exposta).

✅ **Como saber que deu certo:** os arquivos aparecem no GitHub, sem `.env*`.

> Observação: o `.gitignore` ignora a pasta `/docs`; portanto os registros em Markdown ficam só no seu computador e no Projeto do Claude, não no GitHub.

---

## Etapa 8 — Publicar na Vercel

1. Acesse https://vercel.com/new.
2. Em **Import Git Repository**, selecione `portal-cpa` (autorize o GitHub se pedir).
3. Em **Framework Preset**, deve aparecer **Next.js** (automático). Deixe **Build Command** e **Output Directory** padrão.
4. Abra **Environment Variables** e cadastre as 5 variáveis (nome e valor exatamente como no `.env.local`):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   > Cole cada valor sem aspas e sem espaços no começo/fim.
5. Clique em **Deploy** e aguarde 1–3 minutos.
6. Ao terminar, a Vercel mostra uma URL do tipo `https://portal-cpa-xxxx.vercel.app`.

✅ **Como saber que deu certo:** tela de "Congratulations" e a URL abre a tela de login.

---

## Etapa 9 — Domínio próprio e Supabase Auth

### 9.1 Apontar o domínio (opcional, recomendado)
1. Na Vercel: projeto → **Settings → Domains** → **Add** → digite o domínio (ex.: `cpa.impacta.edu.br`).
2. A Vercel mostrará um registro DNS (normalmente **CNAME** para `cname.vercel-dns.com`).
3. Peça ao responsável de TI/DNS da faculdade para criar esse registro.
4. Aguarde a verificação (minutos a algumas horas). O certificado HTTPS é automático.

### 9.2 Configurar as URLs no Supabase Auth
1. Supabase → **Authentication → URL Configuration**.
2. **Site URL:** o domínio final (ex.: `https://cpa.impacta.edu.br`) — ou, se ainda não tiver domínio, a URL `*.vercel.app`.
3. **Redirect URLs:** adicione o mesmo domínio e, se quiser testar pela URL da Vercel, `https://portal-cpa-xxxx.vercel.app/**`.
4. **Save changes**.

✅ **Como saber que deu certo:** o login funciona no endereço final, sem erro de redirecionamento.

---

## Etapa 10 — Testar em produção (checklist)

Abra o site final e teste **com um usuário de cada perfil** (crie-os em `/perfis` com o admin).

### 10.1 Matriz esperada (pós-Registro 0024)

| Perfil | E-mail em `/perfis` | `/inicio` | `/resultados` | `/devolutivas` | `/relatorios` | Gestão |
|---|---|---|---|---|---|---|
| `aluno` | contém `impacta` | título da CPA + bolinha de status; 4 botões | só Aluno Presencial e EAD | só destino Alunos (sem tag) | ver/baixar | não |
| `professor` | contém `impacta` | título da CPA + bolinha de status; 4 botões | só dashboards do perfil `professor` | só destino Professores (sem tag) | ver/baixar | não |
| `coordenador` | contém `impacta` | título da CPA + bolinha de status; 4 botões | os 4 dashboards | todas, com tag `prof`/`aluno`/`func` | ver/baixar + **upload/excluir** | não |
| `avaliador_externo` | livre | "SEJA BEM VINDO" + bolinha `#012a55` (camuflada); **3 botões** | os 4 (usa `embed_url_externo`) | todas, com tag | ver/baixar | não |
| `admin` | contém `impacta` | título da CPA + bolinha de status; **6 botões** | os 4 | todas, com tag + criar/editar/excluir | ver/baixar + upload/excluir | `/cpas` (ano 2003 até o ano atual), `/perfis` |

### 10.2 Roteiro de testes
**Administrador**
1. **Perfis:** criar um usuário de cada cargo (e-mail com `impacta`; só o `avaliador_externo` aceita e-mail livre); tentar criar um `aluno` com e-mail sem `impacta` → deve ser recusado; editar nome/cargo; excluir um usuário de teste.
2. **CPAs:** criar uma CPA ativa para `aluno` e outra ativa para `professor` → **as duas permanecem ativas** (1 por perfil); criar uma segunda ativa para `aluno` → a anterior de `aluno` é encerrada; tentar ano `2002` ou ano futuro → deve ser recusado; alternar Ativar/Encerrar; excluir.
3. **Devolutivas:** em `/devolutivas`, usar **Nova devolutiva** para publicar uma devolutiva para cada destino (Alunos, Professores, Corpo funcional); conferir as tags `aluno`/`prof`/`func`; editar; excluir.
4. **Relatórios:** enviar um PDF; baixar; excluir (confirme que o arquivo some do Storage).
5. **Resultados:** abrir cada acordeão; o painel do Looker Studio deve carregar (exige estar logado no navegador com a conta Google `@impacta`).
6. **Segurança:** logado como `aluno`, tente abrir `/perfis` e `/cpas` pela barra de endereço → deve redirecionar para `/inicio`.
7. Sem login, abra `/inicio` → deve redirecionar para `/login`.

**Coordenador:** em `/relatorios` o formulário de upload e o botão Excluir aparecem; publicar e excluir um PDF funciona; `/cpas` e `/perfis` redirecionam para `/inicio`.

**Avaliador externo:** `/inicio` mostra "SEJA BEM VINDO", sem botão Acessar e com 3 botões centralizados; `/devolutivas` mostra todas as devolutivas com tag; `/relatorios` não mostra upload nem Excluir.

**Aluno e professor:** `/devolutivas` mostra só o próprio destino, sem tag.

### 10.3 Depois do teste
- Apague os usuários e dados criados só para teste (Etapa 6.5).
- Compartilhe o endereço final com a comunidade.

---

## Etapa 11 — Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Build falha: `Cannot find module '@/generated/prisma/client'` | `postinstall` ausente | Etapa 3.1; faça commit e push. |
| `prisma generate` reclama de config/datasource | Arquivo com nome errado ou `DIRECT_URL` ausente | Etapa 3.2; confira `DIRECT_URL` (local e Vercel). |
| Erro de conexão ao banco / timeout | `DATABASE_URL` sem `?pgbouncer=true` ou porta errada | Use porta 6543 com `?pgbouncer=true`. |
| `prepared statement ... already exists` | Faltou `?pgbouncer=true` | Idem acima. |
| Login funciona local e falha em produção | Variáveis não cadastradas na Vercel, ou Site URL errada | Etapa 8 (passo 4) e Etapa 9.2; após alterar variáveis, faça **Redeploy**. |
| Erro ao publicar PDF (permissão/`row-level security`) | Políticas de Storage ausentes | Etapa 6.2. |
| Erro "SUPABASE_SERVICE_ROLE_KEY não configurada" ao criar usuário | Variável ausente na Vercel | Cadastre-a e faça **Redeploy**. |
| Painéis do Looker em branco | Usuário sem login `@impacta` no navegador, ou URL de embed vazia/errada | Faça login Google `@impacta`; revise `dashboards_cpa`. |
| Tela mostra dados de KPIs fictícios (84,2%, 1.420…) em `/resultados` | `embed_url` vazio em `dashboards_cpa` | Preencha o `embed_url` do dashboard. |
| Imagem de fundo do login não aparece | `public/wallpaper.png` ausente | Confirme que o arquivo foi enviado ao GitHub. |

> **Redeploy na Vercel:** projeto → **Deployments** → no último deploy, menu `⋯` → **Redeploy**.

---

## Etapa 12 — Rotina de atualização (depois do primeiro deploy)

1. Altere o código localmente e teste: `npm run build` → `npm start`.
2. Envie:
   ```bash
   git add .
   git commit -m "descrição da mudança"
   git push
   ```
   A Vercel publica automaticamente a cada `push` na branch `main`.
3. **Mudou o banco?** Faça a alteração no Supabase (SQL Editor/Table Editor) e depois, no seu computador:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```
   Faça `push` do `prisma/schema.prisma` atualizado. **Não** use `prisma migrate dev` nem `prisma db push` (regra do Registro 0021).
4. Registre cada alteração em `docs/registros/NNNN-assunto.md` (próximo número livre: **0026**).

---

## Resumo rápido (cola)

```bash
npm ci
# ajustes: postinstall no package.json + renomear prisma7.config.ts -> prisma.config.ts
npx prisma generate
npm run build
npm start
git init && git add . && git commit -m "Portal CPA" && git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portal-cpa.git && git push -u origin main
# Vercel: Import repo -> 5 variáveis -> Deploy
# Supabase: políticas de Storage + Site URL + saneamento de dados
```
