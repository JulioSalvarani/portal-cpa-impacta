# Registro nº 0024 — Implementação no código das adaptações do Registro 0023

| Campo | Valor |
|---|---|
| **Número** | 0024 |
| **Data da alteração** | 19/11/2026 (America/Sao_Paulo) |
| **Tipo** | Implementação de código (Server Actions, páginas, componentes, CSS e libs) |
| **Especificação** | `0023 - Guia Técnico de Adaptações (Portal CPA).md` (itens 3 a 8; 1.3 e 2.2 no código) |
| **Base** | `portal-cpa-novo.rar` (projeto pós-0022, com `prisma.config.ts` renomeado e `roles.cor_hex` já puxado pelo `db pull`) |
| **Próximo registro livre** | **0026** (o 0025 é o guia de deploy, renumerado) |

## 1. Escopo
Itens do Registro 0023 que já estavam feitos no **banco** (SQL aplicado manualmente: reordenação de `roles`, `cor_hex`, políticas de Storage) ou no schema Prisma (`cor_hex`) **não foram refeitos**. Este registro cobre o **código**:

| Item 0023 | Situação antes | Situação agora |
|---|---|---|
| 1.3 `corHex` na sessão | `UsuarioLogado` sem `corHex` | `corHex: string \| null` lido de `roles.cor_hex` |
| 2.2 Relatórios para `coordenador` | só `admin` | `admin` e `coordenador` (actions e tela) |
| 3 `/inicio` do `avaliador_externo` | igual aos demais | banner "SEJA BEM VINDO", bolinha `#012a55`, 3 botões centralizados |
| 4 CPA ativa por perfil | 1 ativa no sistema inteiro | 1 ativa **por perfil** |
| 5 Devolutivas: visão total + tag | filtro por perfil para todos | global para `admin`/`coordenador`/`avaliador_externo`, com tag |
| 6 Botão "Responder" do admin | presente (7 botões) | removido (6 botões) |
| 7 Ano da CPA | 2000 a 2100 | 2003 até o ano atual |
| 8 E-mail com `impacta` | sem regra | regra no servidor e validação preventiva no formulário |

## 2. Arquivos alterados

### 2.1 `src/lib/auth.ts`
- `UsuarioLogado` ganha `corHex`; `getUsuarioLogado()` o preenche com `perfil.roles.cor_hex` (vazio vira `null`).
- Novas constantes e funções: `PERFIS_VISAO_GLOBAL_DEVOLUTIVAS`, `PERFIS_GESTORES_RELATORIOS`, `temVisaoGlobalDevolutivas(role)`, `podeGerenciarRelatorios(role)`.
- Novo guard `exigirGestorRelatorios()` (aceita `admin` e `coordenador`; outros vão para `/inicio`).

### 2.2 Relatórios (item 2.2)
- `src/app/actions/relatorios.ts`: `publicarRelatorioAction` e `excluirRelatorioAction` passam de `exigirAdmin()` para `exigirGestorRelatorios()`.
- `src/app/relatorios/page.tsx`: usa `podeGerenciarRelatorios(usuario.role)`.
- `src/components/relatorios/painel-relatorios.tsx`: a propriedade `isAdmin` foi renomeada para `podeGerenciar` (formulário de upload e botão Excluir em dois cliques).

### 2.3 `/inicio` do avaliador externo e botões do admin (itens 3 e 6)
- `src/components/status-pesquisa.tsx`:
  - Nova propriedade `corHex`; bolinha recebe `backgroundColor: corHex`.
  - `avaliador_externo`: título fixo **"SEJA BEM VINDO"**, bolinha marcada como `aria-hidden` (sem semântica aberta/encerrada), **sem botão Acessar**, e os 3 botões (`Devolutivas`, `Resultados`, `Relatórios`, 148u cada) em `x = 137, 317, 497` — margem de 137u dos dois lados na grade de 782u.
  - `admin`: botão **Responder** removido; restam 6 botões — `Acessar` (0–144u) e 5 atalhos de 115,6u (`x = 156; 283,6; 411,2; 538,8; 666,4`, vão de 12u), fechando exatamente em 782u.
  - Demais perfis: layout inalterado (4 botões).
- `src/app/inicio/page.tsx`: repassa `corHex`; para `avaliador_externo` não consulta mais a tabela `cpas` (o título não é usado).

### 2.4 CPAs (itens 4 e 7)
- `src/lib/cpas-data.ts`: novos `ANO_MINIMO_CPA = 2003` e `anoAtualBrasil()` (ano no fuso America/Sao_Paulo; usado igual no formulário e no servidor).
- `src/app/actions/cpas.ts`:
  - `criarCpaAction`: valida `2003 ≤ ano ≤ ano atual`; ao criar ativa, encerra somente as CPAs ativas com `perfis_permitidos` em comum (`hasSome`).
  - `alternarStatusCpaAction`: lê a CPA-alvo dentro da transação; ao ativar, encerra as demais ativas do mesmo perfil (`id ≠ alvo`); retorna "CPA não encontrada." se o id não existir.
  - Mensagens ajustadas ("…as demais do mesmo perfil foram encerradas").
- `src/components/cpas/painel-cpas.tsx`: campo Ano com `min=2003`, `max=ano atual`, valor padrão = ano atual; opção "Ativa (única)" → "Ativa"; texto "apenas 1 CPA aberta por perfil".

### 2.5 Devolutivas (item 5)
- `src/app/devolutivas/page.tsx`: `admin`, `coordenador` e `avaliador_externo` leem **todas** as `respostas`; `aluno` e `professor` mantêm `perfis_permitidos has role`. Passa `exibirPublico` ao painel.
- `src/components/devolutivas/painel-devolutivas.tsx` e `mural-dialog.tsx`: nova propriedade `exibirPublico`; cada card mostra a tag antes da etiqueta de categoria.
- `src/lib/devolutivas-data.ts`: `rotuloPublicoDevolutiva(perfis)` — contém `aluno` → **aluno**; contém `professor` → **prof**; demais → **func**.
- `src/app/cpa-resposta.css`: nova classe `.cpa-m-pub` (pílula clara com texto azul-marinho, altura 22u).

### 2.6 Usuários (item 8)
- `src/lib/perfis-data.ts`: `PERFIS_EXIGEM_IMPACTA` (aluno, professor, coordenador, admin), `MENSAGEM_EMAIL_IMPACTA` e `emailValidoParaPerfil(email, role)` (sem diferenciar maiúsculas), compartilhados entre servidor e navegador.
- `src/app/actions/perfis.ts`:
  - `criarUsuarioAction`: recusa e-mail sem `impacta` para perfis institucionais; `avaliador_externo` é isento.
  - `editarUsuarioAction`: busca o e-mail do usuário em `profiles`; se o **cargo mudou** para um perfil institucional e o e-mail não contém `impacta`, bloqueia.
- `src/components/perfis/tabela-perfis.tsx`: antes de chamar `criarUsuarioAction`, valida e exibe o alerta na interface.

## 3. Pontos em que a implementação difere do texto do 0023 (e por quê)
1. **Ano da CPA (7.1):** o campo está em `PainelCpas` (`components/cpas/painel-cpas.tsx`), não em `app/cpas/page.tsx`; a alteração foi feita onde o `<input>` existe.
2. **Retorno de erro (7.2 e 8.1):** o código do projeto usa `{ ok: false, mensagem }`; o trecho do 0023 usava `{ erro }`/`mensagem`. Foi mantido o padrão existente.
3. **Ano atual:** em vez de `new Date().getFullYear()` (UTC no servidor), usa-se o ano de America/Sao_Paulo, para que formulário e servidor nunca discordem na virada do ano.
4. **Botão do admin em `/devolutivas`:** já existia como **"Nova devolutiva"** (rota `/devolutivas/responder`); o nome foi mantido porque "Adicionar devolutiva" não cabe ao lado do título da barra sem sobreposição.
5. **Edição de usuário (8.1):** a regra vale quando o cargo muda para um perfil institucional (cobre a promoção de `avaliador_externo`, caso do 0023, e também `aluno→admin` com e-mail externo). Editar apenas o **nome** de contas legadas sem `impacta` continua permitido.
6. **`/inicio` do avaliador externo:** além do exigido, a consulta à tabela `cpas` é pulada (o resultado não era usado).
7. **Devolutivas com `perfis_permitidos` nulo:** continuam assumindo o destino "Alunos" (comportamento anterior), logo aparecem com a tag `aluno` para os perfis globais.

## 4. Matriz consolidada (comportamento atual)

| Perfil | Banner `/inicio` | Botões | `/devolutivas` | `/relatorios` | Gestão |
|---|---|---|---|---|---|
| `aluno` | título + bolinha de status | 4 | só Alunos, sem tag | consulta/download | não |
| `professor` | título + bolinha de status | 4 | só Professores, sem tag | consulta/download | não |
| `coordenador` | título + bolinha de status | 4 | todas, com tag | consulta/download + **upload/exclusão** | não |
| `avaliador_externo` | "SEJA BEM VINDO" + bolinha `#012a55` | 3 | todas, com tag | consulta/download | não |
| `admin` | título + bolinha de status | 6 | todas, com tag + criar/editar/excluir | consulta/download + upload/exclusão | `/cpas`, `/perfis` |

## 5. Pré-requisitos no banco (já executados manualmente, conforme informado)
- SQL da Seção 1.2 do 0023 (reordenação de `roles` e `cor_hex = '#012a55'` para `avaliador_externo`).
- Políticas de Storage do `coordenador` (Seção 2.1 do 0023). **Sem elas, o upload do coordenador falha com erro de permissão**, mesmo com a tela liberada.
- Após qualquer ajuste de banco: `npx prisma db pull` e `npx prisma generate`.

## 6. Verificação realizada
- `tsc --noUnusedLocals` sobre `src/`: nenhum import ou variável sem uso.
- Comparação com o projeto base: nenhum código de erro novo; as ocorrências extras são as mesmas causas de ambiente (sem `node_modules`/cliente Prisma e tipos do React) nas linhas novas.
- Varredura por referências antigas (`isAdmin` em relatórios, "Responder", "única", limites 2000/2100 da CPA): sem resíduos.
- Conferência aritmética da grade `782 × 223u`: admin fecha em 782u; avaliador com 137u de margem simétrica.
- **Não executado:** build do Next e teste visual no navegador (ambiente sem dependências instaladas). Rodar `npm run build` e o roteiro da Seção 10.2 do Registro 0025 antes do deploy.

## 7. Observações fora do escopo (não alteradas)
- O campo Ano do formulário de **relatórios** continua com limite 2000–2100 (o 0023 só trata o ano da CPA).
- O `.gitignore` continua ignorando `/docs`.
