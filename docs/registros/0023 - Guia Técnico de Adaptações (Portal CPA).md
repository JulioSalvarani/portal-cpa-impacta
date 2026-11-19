# Registro nº 0023 — Guia Técnico de Adaptações (Portal CPA)

| Campo | Valor |
| ----- | ----- |
| **Número** | 0023 |
| **Data da alteração** | 19/11/2026 (America/Sao_Paulo) |
| **Tipo** | Adaptações pós-implementação (Reordenação de roles, hex camuflado, permissões de relatórios, fluxo de devolutivas, unicidade de CPA por role, validação de ano e regra de e-mail institucional) |
| **Complementa** | 0021 - Arquitetura e Plano de Implementação Lógica, 0021 - Guia Visual e Arquitetura de Componentes e 0022 - Limpeza de código |
| **Próximo registro livre** | **0024** |

Este documento consolida as **8 adaptações arquiteturais e funcionais** aplicadas ao portal da Comissão Própria de Avaliação (CPA), organizadas na ordem de dependência técnica: **Banco de Dados (Supabase/Prisma) → Regras de Negócio (Server Actions) → Interface e Estilização (Next.js/CSS)**.

## 1. Reordenação da Tabela `roles` e Identificador Hex (`#012a55`)

### 1.1 Nova Hierarquia de Perfis (`public.roles`)

A tabela `public.roles` passa a incluir a coluna `cor_hex` (`text`, anulável) e segue a ordenação hierárquica oficial:

| Novo ID | Identificador (`roles.role`) | Descrição Institucional | `cor_hex` | Comportamento do Indicador (`.cpa-dot`) |
| ----- | ----- | ----- | ----- | ----- |
| `1` | `aluno` | Discentes (Presencial e EAD) | `NULL` | Dinâmico (Verde `#6df24a` / Vermelho `#f20000`) |
| `2` | `professor` | Corpo Docente | `NULL` | Dinâmico (Verde `#6df24a` / Vermelho `#f20000`) |
| `3` | `coordenador` | Coordenação de Curso | `NULL` | Dinâmico (Verde `#6df24a` / Vermelho `#f20000`) |
| `4` | `avaliador_externo` | Avaliador Externo (MEC) | `'#012a55'` | Fixo (`#012a55` — camuflado no banner `.cpa-banner`) |
| `5` | `admin` | Administrador da CPA | `NULL` | Dinâmico (Verde `#6df24a` / Vermelho `#f20000`) |

> **Por que `#012a55`?** O código hexadecimal `#012a55` corresponde exatamente ao token `--cpa-navy` aplicado ao fundo do retângulo central `.cpa-banner` em `/inicio`. Ao preencher `.cpa-dot` com essa cor para o `avaliador_externo`, o indicador visual se camufla ao container, removendo a semântica de pesquisa "aberta/encerrada" para um perfil que não responde ao formulário.

### 1.2 Script SQL de Migração Segura (Supabase → SQL Editor)

Para evitar violação da chave estrangeira `profiles_role_fkey` (`ERROR: 23503`) e da restrição `UNIQUE` em `roles.role`, a migração insere registros temporários (`101` a `105`) antes de mover os usuários de `profiles`, executando tudo dentro de uma única transação:

```sql
BEGIN;

-- 1. Adiciona a coluna cor_hex na tabela public.roles
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS cor_hex text;

-- 2. Cria registros temporários (101 a 105) para manter a integridade referencial da FK
INSERT INTO public.roles (id, role, cor_hex)
VALUES
  (101, 'temp_aluno', NULL),
  (102, 'temp_professor', NULL),
  (103, 'temp_coordenador', NULL),
  (104, 'temp_avaliador_externo', '#012a55'),
  (105, 'temp_admin', NULL);

-- 3. Migra os usuários em public.profiles para os IDs temporários conforme o cargo atual
UPDATE public.profiles p
SET role = CASE r.role
  WHEN 'aluno' THEN 101
  WHEN 'professor' THEN 102
  WHEN 'coordenador' THEN 103
  WHEN 'avaliador_externo' THEN 104
  WHEN 'admin' THEN 105
END
FROM public.roles r
WHERE p.role = r.id;

-- 4. Libera os nomes únicos e reatribui os IDs definitivos (1 a 5) com a cor
UPDATE public.roles
SET role = 'temp_old_' || id
WHERE id BETWEEN 1 AND 5;

UPDATE public.roles SET role = 'aluno',             cor_hex = NULL      WHERE id = 1;
UPDATE public.roles SET role = 'professor',         cor_hex = NULL      WHERE id = 2;
UPDATE public.roles SET role = 'coordenador',       cor_hex = NULL      WHERE id = 3;
UPDATE public.roles SET role = 'avaliador_externo', cor_hex = '#012a55' WHERE id = 4;
UPDATE public.roles SET role = 'admin',             cor_hex = NULL      WHERE id = 5;

-- 5. Aponta os usuários em public.profiles de volta para os IDs definitivos (1 a 5)
UPDATE public.profiles
SET role = role - 100
WHERE role BETWEEN 101 AND 105;

-- 6. Remove os registros temporários e reinicia a sequence de public.roles
DELETE FROM public.roles WHERE id BETWEEN 101 AND 105;
SELECT setval(pg_get_serial_sequence('public.roles', 'id'), 5, true);

COMMIT;
```

### 1.3 Sincronização com Prisma e Sessão (`src/lib/auth.ts`)

1. Atualizar o schema local após executar o SQL no Supabase:

   ```bash
   npx prisma db pull
   npx prisma generate
   ```

2. Incluir `corHex: string | null` no tipo `UsuarioLogado` em `src/lib/auth.ts`, carregando `roles.cor_hex` na consulta do usuário autenticado.

## 2. Permissão de Upload e Exclusão de Relatórios para `coordenador`

### 2.1 Políticas de Storage no Supabase (`storage.objects`)

Como as políticas de RLS no PostgreSQL são `PERMISSIVE` por padrão (combinadas com lógica `OR`), as políticas existentes de `admin` (`relatorios-cpa: upload admin` e `relatorios-cpa: delete admin`) são mantidas intactas e complementadas pelas políticas de `coordenador`:

```sql
-- 1. Cria a função auxiliar para validar o cargo coordenador
create or replace function private.is_coordenador()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role
    where p.user_id = auth.uid() and r.role = 'coordenador'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_coordenador() to authenticated;

-- 2. Adiciona as políticas de escrita no bucket relatorios-cpa para coordenador
create policy "relatorios-cpa: upload coordenador"
on storage.objects for insert to authenticated
with check (bucket_id = 'relatorios-cpa' and private.is_coordenador());

create policy "relatorios-cpa: delete coordenador"
on storage.objects for delete to authenticated
using (bucket_id = 'relatorios-cpa' and private.is_coordenador());
```

### 2.2 Autorização no Next.js (`/relatorios`)

* **`src/app/actions/relatorios.ts`:** Nas Server Actions `publicarRelatorioAction` e `excluirRelatorioAction`, substituir a trava exclusiva de administrador por uma verificação que aceite `["admin", "coordenador"]`.
* **`src/app/relatorios/page.tsx`:** Atualizar a flag de permissão (`const podeGerenciarRelatorios = ["admin", "coordenador"].includes(usuario.role)`) para renderizar o formulário de upload `.cpa-rel-upload` e o botão de exclusão em dois cliques também para `coordenador`.

## 3. Adaptação da Tela `/inicio` para `avaliador_externo`

### 3.1 Banner Central e Bolinha Camuflada (`src/components/status-pesquisa.tsx`)

Quando `role === "avaliador_externo"`, o retângulo central `.cpa-banner` em `/inicio`:

1. Exibe o texto fixo **`"SEJA BEM VINDO"`** no lugar do título dinâmico da pesquisa (`titulo`).
2. Aplica `corHex` (`#012a55`) na bolinha indicadora (`.cpa-dot`), camuflando-a no fundo `--cpa-navy` do container:

```tsx
const ehAvaliadorExterno = role === "avaliador_externo";
const textoBanner = ehAvaliadorExterno ? "SEJA BEM VINDO" : titulo;
const estiloDot = corHex ? { backgroundColor: corHex } : undefined;
```

### 3.2 Remoção do Botão de Acesso à CPA e Redistribuição da Grade

* **Ocultação do botão primário:** Para `avaliador_externo`, o botão `Acessar` / `Encerrada` (vinculado a `formLink`) não é renderizado.
* **Alinhamento na grade `960 × 540u` (`src/lib/cpa-box.ts`):** Os **3 botões restantes** (`Devolutivas`, `Resultados` e `Relatórios`) são redistribuídos de forma centralizada e simétrica na fileira inferior de `StatusPesquisa`.
* **Acesso às devolutivas:** O botão `Devolutivas` permanece ativo e redireciona para `/devolutivas` com leitura irrestrita.

## 4. Unicidade de CPA Ativa (`is_active = true`) Filtrada por Role

Em `src/app/actions/cpas.ts`, a transação executada nas Server Actions `criarCpaAction` e `alternarStatusCpaAction` passa a encerrar apenas pesquisas ativas que compartilhem o mesmo perfil-alvo (`perfis_permitidos`), permitindo até **1 CPA ativa por role** simultaneamente e preservando o histórico de pesquisas encerradas (`is_active = false`):

```ts
await prisma.$transaction(async (tx) => {
  if (deveAtivar) {
    await tx.cpas.updateMany({
      where: {
        is_active: true,
        perfis_permitidos: { hasSome: perfisAlvo },
      },
      data: { is_active: false },
    });
  }

  // Cria ou ativa a CPA alvo logo em seguida
});
```

## 5. Visibilidade Total e Tag de Público-Alvo nas Devolutivas

### 5.1 Consulta de Registros (`src/app/devolutivas/page.tsx`)

* **`admin`, `coordenador` e `avaliador_externo`:** Consultam todas as devolutivas cadastradas na tabela `respostas` (sem filtro por `perfis_permitidos`), visualizando registros destinados a Alunos, Professores e Corpo funcional.
* **`aluno` e `professor`:** Mantêm o filtro restritivo `where: { perfis_permitidos: { has: usuario.role } }`.

### 5.2 Tag Identificadora nos Cards (`.cpa-m-item`)

Para perfis com visão global (`["admin", "coordenador", "avaliador_externo"]`), cada card na lista `.cpa-m-list` exibe uma tag compacta indicando o público-alvo da devolutiva:

| Público-alvo (`perfis_permitidos`) | Rótulo da Tag | Visível para |
| ----- | ----- | ----- |
| `professor` | `prof` | `admin`, `coordenador`, `avaliador_externo` |
| `aluno` | `aluno` | `admin`, `coordenador`, `avaliador_externo` |
| Corpo funcional / outros | `func` | `admin`, `coordenador`, `avaliador_externo` |

*(Para `aluno` e `professor`, nenhuma tag é renderizada nos cards).*

## 6. Remoção do Botão de Atalho "Responder" da Visão `admin` em `/inicio`

* **Navegação em `/inicio` (`src/components/status-pesquisa.tsx`):** O botão de atalho **Responder** é removido da barra inferior do perfil `admin`, reduzindo o total de 7 para **6 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`, `CPAs` e `Perfis`). As coordenadas horizontais na grade `960 × 540u` são recalculadas para manter o alinhamento simétrico.
* **Fluxo de criação:** A rota `/devolutivas/responder` permanece ativa e protegida normalmente; o cadastro de novas devolutivas pelo administrador passa a ser acionado exclusivamente pelo botão **Adicionar devolutiva** localizado dentro de `/devolutivas`.

## 7. Limite de Intervalo de Anos na Criação de CPA (`2003` até o Ano Atual)

### 7.1 Validação no Front-end (`src/app/cpas/page.tsx`)

Configurar o campo numérico de ano no formulário de cadastro com piso em `2003` e teto dinâmico no ano corrente:

```tsx
const anoAtual = new Date().getFullYear();

<input
  type="number"
  name="ano"
  min={2003}
  max={anoAtual}
  defaultValue={anoAtual}
  required
/>
```

### 7.2 Validação no Back-end (`src/app/actions/cpas.ts` → `criarCpaAction`)

Aplicar a mesma regra no servidor antes de persistir o registro no banco:

```ts
const anoAtual = new Date().getFullYear();

if (!Number.isInteger(ano) || ano < 2003 || ano > anoAtual) {
  return { erro: `O ano da CPA deve estar entre 2003 e ${anoAtual}.` };
}
```

## 8. Validação de Domínio Institucional (`impacta`) na Criação e Edição de Usuários

### 8.1 Regra de Negócio no Back-end (`src/app/actions/perfis.ts`)

Na gestão interna de usuários (`/perfis`), contas vinculadas aos perfis institucionais (**`aluno`**, **`professor`**, **`coordenador`** e **`admin`**) só podem ser criadas se o endereço de e-mail contiver a palavra **`impacta`** (verificação *case-insensitive*, cobrindo domínios como `@impacta.edu.br`, `@aluno.impacta.edu.br`, etc.). Apenas o cargo **`avaliador_externo`** (avaliadores do MEC) é isento dessa restrição:

```ts
const PERFIS_EXIGEM_IMPACTA = new Set<PerfilCpa>([
  "aluno",
  "professor",
  "coordenador",
  "admin",
]);

// Aplicado em criarUsuarioAction (e ao promover um avaliador_externo em editarUsuarioAction)
const emailNormalizado = email.trim().toLowerCase();

if (PERFIS_EXIGEM_IMPACTA.has(role) && !emailNormalizado.includes("impacta")) {
  return {
    ok: false,
    mensagem:
      "Perfis institucionais (aluno, professor, coordenador e admin) devem conter 'impacta' no e-mail.",
  };
}
```

> **Salvaguarda na edição (`editarUsuarioAction`):** Caso o administrador tente alterar o cargo de um `avaliador_externo` existente para um dos 4 perfis institucionais, a action também valida se o `email` registrado em `public.profiles` contém `"impacta"`, bloqueando a promoção caso o usuário possua apenas e-mail externo.

### 8.2 Validação Preventiva no Front-end (`src/components/perfis/tabela-perfis.tsx`)

No formulário de criação `.cpa-perfis-upload`, validar antes do envio se `role !== "avaliador_externo"` e `!email.toLowerCase().includes("impacta")`, exibindo o alerta de validação imediatamente na interface antes de acionar `criarUsuarioAction`.

## 9. Matriz Consolidada de Permissões e Comportamento (Pós-Adaptações)

| ID | Perfil (`roles.role`) | Regra de E-mail (`/perfis`) | Banner `/inicio` | Botões em `/inicio` | `/resultados` | `/devolutivas` | `/relatorios` | Gestão (`/cpas`, `/perfis`) |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `1` | **`aluno`** | Obrigatório conter `impacta` | Título CPA + dot status | **4** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Aluno Presencial e EAD | Apenas Alunos (sem tag) | Consulta e download | Não |
| `2` | **`professor`** | Obrigatório conter `impacta` | Título CPA + dot status | **4** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Dashboards Professor | Apenas Professores (sem tag) | Consulta e download | Não |
| `3` | **`coordenador`** | Obrigatório conter `impacta` | Título CPA + dot status | **4** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) | Todos os 4 dashboards | **Todas** (com tag `prof`/`aluno`/`func`) | Consulta, download, **upload e exclusão** | Não |
| `4` | **`avaliador_externo`** | Livre (sem restrição) | `"SEJA BEM VINDO"` + dot `#012a55` | **3** (`Devolutivas`, `Resultados`, `Relatórios`) | Todos os 4 dashboards (usa `embed_url_externo` se preenchido) | **Todas** (com tag `prof`/`aluno`/`func`) | Consulta e download | Não |
| `5` | **`admin`** | Obrigatório conter `impacta` | Título CPA + dot status | **6** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`, `CPAs`, `Perfis`) | Todos os 4 dashboards | **Todas** (com tag) + criar/editar/excluir | Consulta, download, **upload e exclusão** | Sim (`/cpas` com ano `2003..atual`, `/perfis`) |