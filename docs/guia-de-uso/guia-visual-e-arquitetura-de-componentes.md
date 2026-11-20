# Guia Visual e Arquitetura de Componentes — Portal CPA

| Campo | Valor |
|---|---|
| **Projeto** | Portal CPA — Comissão Própria de Avaliação (Faculdade Impacta) |
| **Tipo** | Documentação Visual Definitiva (Escala Proporcional, Folhas CSS, Catálogo de Componentes e Mapa de Rotas) |
| **Sistema de Layout** | Palco 16:9 proporcional (`960 × 540u` no desktop) + Empilhamento responsivo fluido (`≤ 768px`) |
| **Estado do Projeto** | Interface 100% finalizada, limpa e alinhada às regras de negócio dos 5 perfis RBAC |

---

## 1. Processo e Arquitetura do Sistema Visual

O **Portal CPA (Comissão Própria de Avaliação — Faculdade Impacta)** utiliza uma arquitetura visual híbrida que separa rigorosamente **geometria** (posição e dimensões) de **aparência** (cores, bordas, tipografia e estados):

1. **Primitivos de acessibilidade e interação:** componentes **shadcn/ui** (Radix UI, preset Vega) em `src/components/ui/`.
2. **Geometria e estilização proprietárias:** sistema de escala proporcional baseado em uma tela de referência **16:9 (`960 × 540`)**, controlado exclusivamente por CSS puro (`src/app/cpa.css` e `src/app/cpa-resposta.css`) e helpers geométricos (`src/lib/cpa-box.ts`).

### 1.1 Escala Proporcional (`--u`) e Palco de Tela
- **Unidade base (`--u`):** Definida no `:root` como `min(calc(100vw / 960), calc(100vh / 540))`. Cada `1u` equivale a `1px` do mockup de referência, redimensionando proporcionalmente à janela.
- **Estrutura de Viewport:**
  1. `.cpa-root`: container externo fixo (`100dvh`), sem barra de rolagem global no desktop. Na tela de login, recebe o modificador `.cpa-root--login` com imagem de fundo exclusiva (`url("/wallpaper.png")`).
  2. `.cpa-stage`: palco interno (`width: 100%`, `height: 100%` sobre a grade `960 × 540u`) que serve de referência de coordenadas para todos os elementos posicionados, enquanto faixas horizontais acompanham a largura da tela.
- **Tipografia e Favicon (`src/app/layout.tsx`):**
  - Fonte principal: **`Share Tech Mono`** carregada via `next/font/google` na variável CSS `--font-ui` (`weight: "400"`, `subsets: ["latin"]`), consumida por `--cpa-mono` (`"Share Tech Mono", ui-monospace, monospace`).
  - Idioma raiz configurado como `<html lang="pt-BR">` e ícone global das abas configurado via `src/app/icon.png` (ou `metadata.icons`).

### 1.2 Helpers de Geometria (`src/lib/cpa-box.ts`)

| Helper | Assinatura | Comportamento CSS Gerado |
|---|---|---|
| `u(n)` | `(n: number) => string` | Converte números do mockup para `calc(n * var(--u))`. |
| `box(x, y, w, h, extra?)` | `(x, y, w, h, extra?) => CSSProperties` | Posicionamento absoluto (`position: absolute`) a partir do canto superior esquerdo (`left`, `top`, `width`, `height`) em unidades `u`. |
| `size(w, h, extra?)` | `(w, h, extra?) => CSSProperties` | Define apenas `width` e `height` em unidades `u` com `flex: none` (usado dentro de containers `flex` ou `grid`). |
| `band(opts, extra?)` | `({ left, right, top, bottom, h }, extra?) => CSSProperties` | Cria faixas horizontais ancoradas nas bordas (`left`, `right`, `top`/`bottom` e `height` em `u`). |

### 1.3 Regras Críticas de Estilização (Convivência com Tailwind v4 e shadcn/ui)
1. **Geometria Inline vs. Aparência em Classes:** Posição e tamanho no desktop usam `u()`, `box()`, `size()` ou `band()`; aparência (cores, bordas, tipografia, estados e media queries) fica centralizada em `src/app/cpa.css` e `src/app/cpa-resposta.css`.
2. **Isolamento contra Utilitários Tailwind:** **Nunca utilizar classes utilitárias do Tailwind CSS** (`flex`, `grid`, `p-4`, `m-*`, `bg-*`, etc.) para posicionar ou estilizar elementos internos das telas.
3. **Centralização Segura de Modais em Qualquer Resolução:**
   - Elementos comuns usam `.cpa-center` (`left: 50%; top: 50%; translate: -50% -50%`).
   - Modais (`DialogContent`) renderizados via Portal do Radix utilizam `.cpa-modal.cpa-modal` ancorada no centro da viewport com `top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; z-index: 9999 !important; opacity: 1 !important; visibility: visible !important;`, combinada com `className="cpa-modal translate-x-0 translate-y-0"` (e `.cpa-modal--resposta` com variantes `.cpa-modal--admin` / `.cpa-modal--edicao`).
   - O botão fechar nativo do shadcn Dialog é sempre qualificado com `[data-slot="dialog-close"]` para não afetar o container do modal nem botões internos.
4. **Uniformidade e Proteção de Hover em Barras CRUD:**
   - Todos os inputs e selects dentro de `.cpa-perfis-upload`, `.cpa-cpas-upload`, `.cpa-rel-upload` e `.cpa-perfil-row` possuem altura uniforme `height: calc(34 * var(--u))` (`40px` no mobile).
   - Seletores de botões dentro de barras e listas administrativas (`/relatorios`, `/cpas`, `/perfis`) incluem `.cpa-stage` e os estados `:hover`, `:active` e `:focus-visible` com `padding: 0 calc(16 * var(--u))` e `white-space: nowrap`, impedindo que `.cpa-stage .cpa-btn:hover` zere o espaçamento interno.
5. **Adaptação Responsiva (`@media (max-width: 768px)`):**
   - `.cpa-root` libera `height: auto`, `min-height: 100vh` e `overflow-y: auto`.
   - `.cpa-stage` converte-se em container vertical fluido (`width: 100%`, `height: auto`, `display: flex`, `flex-direction: column`, `gap: 16px`, `padding: 14px`), redefinindo `--u: 1px` e convertendo os filhos posicionados e grades CRUD (`.cpa-rel-upload`, `.cpa-cpas-upload`, `.cpa-perfis-upload`, `.cpa-cpa-row`, `.cpa-perfil-row--crud`) em blocos empilhados de coluna única legíveis em dispositivos móveis.

---

## 2. O Que Existe em Cada Arquivo `.css`

### 2.1 `src/app/cpa.css` (Folha Principal do Sistema)
- **Tokens e Palco (`:root`, `.cpa-root`, `.cpa-stage`):**
  - `--cpa-navy` (`#012a55`), `--cpa-on-navy` (`#f4f6f9`), `--cpa-panel` (`#d9d9d9`), `--cpa-panel-light` (`#efefef`), `--cpa-line` (`#111111`).
  - Status da pesquisa: `--cpa-dot` (`#6df24a`), `--cpa-tag-negado` (`#f20000`) e cor dinâmica por perfil via `roles.cor_hex` (`#012a55` para `avaliador_externo`, camuflando a bolinha no container azul-marinho).
  - Barras: `--cpa-bar-negado` (`#c40000`) e cores dinâmicas das categorias vindas de `status_respostas.hex`.
- **Peças Comuns e Utilitários:** `.cpa-center`, `.cpa-sr`, `.cpa-bar`, `.cpa-pill`, `.cpa-btn` (`--line`, `--ghost`, `--disabled`), `.cpa-card`, `.cpa-label`, `.cpa-flabel`, `.cpa-field`, `.cpa-select`, `.cpa-textarea`, `.cpa-form-error`, `.cpa-form-feedback`.
- **Login (`/login`):** `.cpa-root.cpa-root--login` com `background-image: url("/wallpaper.png")`, `background-size: cover`, `background-position: center`, exibindo o cartão centralizado `.cpa-card.cpa-center` (`588 × 284u`).
- **Painel Principal (`/inicio`):** `.cpa-home`, `.cpa-home-header`, `.cpa-logout` (hover vermelho), `.cpa-profile` (indicador estático com `cursor: default; user-select: none;`, sem `:hover`), `.cpa-banner` e `.cpa-dot`.
- **Modal de Contato (`ContatoInfoDialog`):** `.cpa-contact-*` com informações institucionais e botões para Google Chats e Google Meet.
- **Central de Devolutivas (`/devolutivas`) e Mural:** `.cpa-panel`, trilha horizontal `.cpa-years` com scrollbar em pílula (`26u`), `.cpa-year` (`270 × 300u`), `.cpa-chart`, lista rolável `.cpa-m-list` e cards uniformes `.cpa-m-item` (`min-height: calc(64 * var(--u))`) onde `.cpa-m-text` possui altura fixa de 2 linhas (`height: calc(48 * var(--u))`) com rolagem vertical (`overflow-y: auto`) para exibir títulos extensos por completo sem cortes.
- **Resultados (`/resultados`):** `.cpa-results`, acordeão `<details class="cpa-cpa">` com `<summary>` azul-marinho (`72u`), aviso de conta Google `@impacta` e container rolável `.cpa-embed-wrap` para o `<iframe>` do Looker Studio (`height="1600"`).
- **Padrão Visual de Barras CRUD Administrativas (`/relatorios`, `/cpas` e `/perfis`):**
  - Container superior arredondado (`background: #efefef`, `border: 1px solid #c7c7c7`, `border-radius: 20u`) aplicado via `.cpa-rel-upload` (5 colunas), `.cpa-cpas-upload` (6 colunas) e `.cpa-perfis-upload` (5 colunas), acompanhado de listas roláveis de cartões (`#efefef`) e confirmação de exclusão em dois cliques (`Excluir` → `Confirmar?`).

### 2.2 `src/app/cpa-resposta.css` (Folha Complementar de Respostas e Etiquetas)
- Estiliza o modal secundário **`RespostaDialog`** (`.cpa-modal--resposta` `560 × 330u`, `.cpa-modal--admin` `380u` e `.cpa-modal--edicao` `442u`), herdando a centralização `top: 50%; left: 50%; transform: translate(-50%, -50%)` de `.cpa-modal.cpa-modal`, com blocos internos (`Título`, `Área responsável`, `Justificativa` com rolagem `.cpa-m-text--scroll` e campos de 1 linha `.cpa-m-text--short`).
- Define `.cpa-m-actions`, `.cpa-m-ver` (botão `"Ver resposta"`), `.cpa-m-pub` (pílula clara com texto azul-marinho `#012a55` e altura `22u` exibindo `aluno`, `prof` ou `func` para os perfis de visão global) e **`EtiquetaCategoria`** (`.cpa-tag` com `min-width: 132u` e cor dinâmica via `hex` do banco).

### 2.3 `src/app/globals.css` (Base Tailwind v4 e Tokens shadcn/ui)
- Dá suporte estrutural aos primitivos Radix/shadcn (`Dialog`, `Badge`, `Button`, `Input`, `Label`), sem tokens legados em HSL nem classes utilitárias não utilizadas.

---

## 3. Catálogo de Componentes Ativos

### 3.1 Componentes Compartilhados, Painel e Contato (`src/components/`)

| Componente | Arquivo | Tipo | Responsabilidade e Estrutura Visual |
|---|---|---|---|
| `BarraInstitucional` | `barra-institucional.tsx` | Server | Faixa azul-marinho (`#012a55`, `border-radius: 10u`) usada como `<header>` (`68u`) e `<footer>` (`44u`) nas telas internas, com botão `ArrowLeft` opcional. |
| `LoginForm` | `login-form.tsx` | Client | Formulário horizontal dentro do cartão `.cpa-card.cpa-center` (`588 × 284u`) de `/login` ligado a `loginAction`: rótulos à esquerda (`x: 75`), campos `E-Mail` (`#email`) e `Senha` (`#senha`, sem placeholder) em `x: 198`, slot `.cpa-form-error` e botão `Entrar` (`.cpa-btn--line`, `box(226, 218, 131, 49)`). |
| `HomeHeader` | `home-header.tsx` | Client | Cabeçalho de `/inicio` (`band({ left: 43, right: 0, top: 21, h: 60 })`): botão de logout (`.cpa-logout`, `58 × 52u`) com ícone `LogOut`, botão `"i"` (`54 × 44u`) acionando `ContatoInfoDialog`, pílula de saudação (`Seja bem vindo, {nome}!`) e indicador estático `<div>` de perfil direito (`.cpa-profile`, `185 × 60u`, `cursor: default`) exibindo os 5 cargos (`Aluno`, `Professor`, `Coordenador`, `Avaliador Ext.`, `Administrador`) + `UserRound`. |
| `ContatoInfoDialog` | `contato-info-dialog.tsx` | Client | Modal institucional (`620 × 350u`) aberto pelo botão `"i"`: apresenta a finalidade da CPA, o e-mail `cpa@impacta.edu.br` e botões externos para **Google Chats** e **Google Meet**. |
| `StatusPesquisa` | `status-pesquisa.tsx` | Client | Bloco central de `/inicio` (`782 × 223u`) adaptado por perfil:<br>• **Banner anual (`box(0, 0, 782, 93)`):** para `avaliador_externo`, exibe o título fixo `"SEJA BEM VINDO"` e aplica `corHex` (`#012a55`, `aria-hidden`) na bolinha `.cpa-dot` para camuflá-la no container; para os demais perfis, exibe o título centralizado da CPA (`padding: 0 76u`, fonte `u(24)` se `> 28` caracteres ou `u(42)`) e `.cpa-dot` verde/vermelha à direita (`right: 36u`).<br>• **Fileira de navegação:**<br>  – `avaliador_externo`: **3 botões** (`Devolutivas`, `Resultados`, `Relatórios`, `148u` cada em `x = 137, 317, 497`), sem botão `Acessar`.<br>  – `aluno`, `professor`, `coordenador`: **4 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`).<br>  – `admin`: **6 botões** (`Acessar` + `Devolutivas`, `Resultados`, `Relatórios`, `CPAs` com `ClipboardList` e `Perfis` com `UsersCog`; sem o atalho `Responder`). |

### 3.2 Componentes de Domínio (`src/components/*`)

| Módulo | Componente / Arquivo | Tipo | Responsabilidade e Estrutura Visual |
|---|---|---|---|
| **CPAs** | `PainelCpas` (`cpas/painel-cpas.tsx`) | Client | Barra superior `.cpa-cpas-upload` (6 colunas: Título, Link Forms, Perfil permitido com os 5 cargos, Ano `76u` com `min=2003` e `max=anoAtualBrasil()`, Status inicial `Ativa`/`Encerrada` e `Criar CPA`) + lista rolável `.cpa-cpa-row` indicando regra de **1 CPA aberta por perfil**, `.cpa-dot`, badge do perfil, ano, link externo, botão `Ativar`/`Encerrar` e `Excluir` (2 cliques). |
| **Devolutivas** | `PainelDevolutivas` (`devolutivas/painel-devolutivas.tsx`) | Client/Server | Painel cinza com trilha horizontal rolável (`.cpa-years`) de cartões anuais, repassando `exibirPublico` para `MuralDialog`. |
| **Devolutivas** | `CartaoAno` (`devolutivas/cartao-ano.tsx`) | Server | Cartão anual (`270 × 300u`) com cabeçalho azul (`box(0, 0, 270, 56)`), subtítulo (`box(10, 72, 250, 18)`), caixa do gráfico (`box(14, 102, 242, 176)`) repassando `ano` e `contagem` para `GraficoStatus`, e margem inferior de `22u`. |
| **Devolutivas** | `GraficoStatus` (`devolutivas/grafico-status.tsx`) | Server | Barras verticais proporcionais com as cores hexadecimais de `status_respostas` (`Resolvido`, `Inapto`, `Impertinente`). |
| **Devolutivas** | `MuralDialog` (`devolutivas/mural-dialog.tsx`) | Client | Modal (`662 × 370u`) com título e lista simétricos (`box(43, 15, 576, 53)` e `box(43, 82, 576, 272)`), botão fechar `×` (`top: 29.5u, left: 10u, 24 × 24u`), rolagem vertical `.cpa-m-list`, cards uniformes (`min-height: 64u`) com título rolável (`height: 48u; overflow-y: auto`), botão `Ver resposta`, tag de público `.cpa-m-pub` (`aluno`/`prof`/`func` quando `exibirPublico = true`) e `EtiquetaCategoria`. |
| **Devolutivas** | `RespostaDialog` (`devolutivas/resposta-dialog.tsx`) | Client | Segundo modal (`560 × 330u`, `.cpa-modal--resposta`) exibindo Título, Área responsável + badge e Justificativa rolável. Quando `isAdmin = true` (`.cpa-modal--admin`), exibe `Editar` e `Excluir` (confirmação inline) e alterna para edição inline (`.cpa-modal--edicao`, `476 × 344u`) com seleção hierárquica (`radio`) de destinatário (`Alunos`, `Professores`, `Corpo funcional`). |
| **Devolutivas** | `FormResposta` (`devolutivas/form-resposta.tsx`) | Client | Formulário administrativo (`640 × 432u`) com respiro vertical de `16u` entre blocos: Título, Área responsável, Categoria, `radiogroup` de destinatário (`Alunos`, `Professores`, `Corpo funcional`) e Motivo da resposta. |
| **Devolutivas** | `EtiquetaCategoria` (`devolutivas/etiqueta-categoria.tsx`) | Server | Badge arredondado colorido conforme status (`min-width: 132u`). |
| **Resultados** | `CartaoCpa` (`resultados/cartao-cpa.tsx`) | Server | Acordeão expansível representando cada público autorizado (*Aluno(a) Presencial*, *Aluno(a) EAD*, *Professores*, *Corpo Técnico Administrativo*), exibindo aviso de login `@impacta` (ou link externo MEC) e `.cpa-embed-wrap` com o `<iframe>` do Looker Studio. |
| **Relatórios** | `PainelRelatorios` (`relatorios/painel-relatorios.tsx`) | Client | Abas de filtro (*Todos*, *Relatório de Autoavaliação*, *Boletim Informativo*), barra superior `.cpa-rel-upload` (5 colunas, exibida quando `podeGerenciar = true` para `admin` e `coordenador`) e lista rolável com `Baixar PDF` e `Excluir` (2 cliques, remove do Storage e banco). |
| **Perfis** | `TabelaPerfis` (`perfis/tabela-perfis.tsx`) | Client | Barra superior `.cpa-perfis-upload` (5 colunas: Nome, E-mail com validação preventiva de `"impacta"` para cargos institucionais, Senha inicial, Cargo com os 5 perfis, `Criar Usuário`) + lista rolável `.cpa-perfil-row--crud` com edição inline de nome e cargo (`<select class="cpa-select">`), botão `Salvar` e `Excluir` (2 cliques). |

---

## 4. Disposição dos Componentes por Página (8 Rotas Ativas)

1. **`/` (`src/app/page.tsx`) e `/pesquisa` (`src/app/pesquisa/page.tsx`):**
   - `/`: redireciona para `/login` (ou `/inicio` se autenticado).
   - `/pesquisa`: executa `redirect("/inicio")` (substituída pelo link externo `cpas.form_link`).
2. **`/login` (`src/app/login/page.tsx`):**
   - Container `<div className="cpa-root cpa-root--login">` com imagem de fundo `url("/wallpaper.png")` e `<main className="cpa-card cpa-center" style={size(588, 284)}>` contendo o título `Login - CPA` e `<LoginForm />`.
3. **`/inicio` (`src/app/inicio/page.tsx`):**
   - `<HomeHeader />` (`band({ left: 43, right: 0, top: 21, h: 60 })`), `<StatusPesquisa />` (`782 × 223u`, centralizado horizontalmente e `39.5u` abaixo do centro vertical) e `<BarraInstitucional as="footer" />` (`band({ left: 21, right: 21, bottom: 22, h: 60 })`).
4. **`/devolutivas` (`src/app/devolutivas/page.tsx`):**
   - `<BarraInstitucional as="header">` (`band({ left: 10, right: 10, top: 13, h: 68 })`, com botão `Nova devolutiva` para `admin`), `<PainelDevolutivas />` (`band({ left: 14, right: 14, top: 96, bottom: 72 })`) com `<MuralDialog />` + `<RespostaDialog />` e `<BarraInstitucional as="footer" />` (`band({ left: 14, right: 14, bottom: 14, h: 44 })`).
5. **`/devolutivas/responder` (`src/app/devolutivas/responder/page.tsx` — `admin`):**
   - `<BarraInstitucional as="header">` (`band({ left: 10, right: 10, top: 13, h: 68 })`) e `<section className="cpa-card cpa-center" style={{ ...size(640, 432), top: "calc(50% + 38u)" }}>` contendo `<FormResposta />`.
6. **`/resultados` (`src/app/resultados/page.tsx`):**
   - `<BarraInstitucional as="header">` (`band({ left: 10, right: 10, top: 13, h: 68 })`) e lista rolável `.cpa-results` (`band({ left: 32, right: 22, top: 100, bottom: 16 })`) contendo `<CartaoCpa />`.
7. **`/relatorios` (`src/app/relatorios/page.tsx`):**
   - `<BarraInstitucional as="header">` (`band({ left: 10, right: 10, top: 13, h: 68 })`), `.cpa-panel` (`band({ left: 14, right: 14, top: 96, bottom: 72 })`) com `<PainelRelatorios podeGerenciar={...} />` e `<BarraInstitucional as="footer" />` (`band({ left: 14, right: 14, bottom: 14, h: 44 })`).
8. **`/cpas` (`src/app/cpas/page.tsx` — `admin`) e `/perfis` (`src/app/perfis/page.tsx` — `admin`):**
   - `<BarraInstitucional as="header">` (`band({ left: 10, right: 10, top: 13, h: 68 })`), `.cpa-panel` (`band({ left: 14, right: 14, top: 96, bottom: 72 })`) contendo `<PainelCpas />` ou `<TabelaPerfis />` e `<BarraInstitucional as="footer" />` (`band({ left: 14, right: 14, bottom: 14, h: 44 })`).

---

## 5. Diretrizes de Manutenção e Preservação Visual

1. **Base Limpa:** Todos os arquivos obsoletos da fase de prototipagem foram removidos (`src/app/login/actions.ts`, `src/components/rede-de-pontos.tsx`, `src/components/ui/card.tsx`, `src/components/ui/scroll-area.tsx`, `src/lib/resultados-data.ts`, `src/components/resultados/grafico-pizza.tsx`, `src/lib/auth-mock.ts`, `src/lib/session.ts`, `src/lib/perfis.ts` e `src/components/devolutivas/etiqueta-status.tsx`).
2. **Preservação de Geometria:** Qualquer ajuste visual futuro dentro de `.cpa-stage` deve continuar utilizando `box()`, `size()` e `band()` (`src/lib/cpa-box.ts`) e estilos centralizados em `src/app/cpa.css` e `src/app/cpa-resposta.css`, respeitando a regra de não utilizar classes utilitárias do Tailwind CSS nos elementos internos.