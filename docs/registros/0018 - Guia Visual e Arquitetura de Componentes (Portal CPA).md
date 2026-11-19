# Guia Visual e Arquitetura de Componentes — Portal CPA (Faculdade Impacta)

> **Finalidade:** Documento de contexto visual e estrutural do front-end do **Portal CPA**. Serve para orientar novas conversas de desenvolvimento ou manutenção sem quebrar o layout, as proporções ou a identidade visual já aprovados.

---

## 1. Processo e Arquitetura do Sistema Visual

O visual do Portal CPA foi construído com uma **arquitetura híbrida** que separa rigorosamente **geometria** (posição e dimensões) de **aparência** (cores, bordas, tipografia e estados de interação), garantindo fidelidade absoluta ao mockup original em proporção **16:9 (`960 × 540`)**.

### 1.1 Escala Proporcional (`--u`) e Palco de Tela
* **Unidade base (`--u`):** Definida no `:root` como `min(100vw / 960, 100vh / 540)`. Cada `1u` corresponde a `1px` do mockup de referência, redimensionando proporcionalmente conforme a janela do navegador.
* **Estrutura de Viewport:**
  1. `.cpa-root`: container externo fixo (`100vw × 100vh`), sem barra de rolagem global na página.
  2. `.cpa-stage`: palco interno (`100% × 100%`) que serve de referência de coordenadas para todos os elementos posicionados da tela, enquanto faixas horizontais (cabeçalhos e rodapés) acompanham a largura total da janela.
* **Tipografia:** Configurada globalmente no `src/app/layout.tsx` (`lang="pt-BR"`) utilizando a fonte **`Share Tech Mono`** (via `next/font/google`, exposta na variável `--font-ui` e consumida por `--cpa-mono`).

### 1.2 Helpers de Geometria (`src/lib/cpa-box.ts`)
Toda posição e tamanho são aplicados via `style` inline calculado pelas funções utilitárias de `src/lib/cpa-box.ts`, evitando conflitos com classes utilitárias do Tailwind CSS:

| Helper | Assinatura | Comportamento CSS Gerado |
|---|---|---|
| `u(n)` | `(n: number) => string` | Converte números do mockup para `calc(n * var(--u))`. |
| `box(x, y, w, h, extra?)` | `(x, y, w, h, extra?) => CSSProperties` | Posicionamento absoluto (`position: absolute`) a partir do canto superior esquerdo (`left`, `top`, `width`, `height`) em unidades `u`. |
| `size(w, h, extra?)` | `(w, h, extra?) => CSSProperties` | Define apenas `width` e `height` em unidades `u` com `flex: none` (usado dentro de containers `flex`). |
| `band(opts, extra?)` | `({ left, right, top, bottom, h }, extra?) => CSSProperties` | Cria faixas horizontais ancoradas nas bordas (`left`, `right`, `top`/`bottom` e `height` em `u`) que se estendem conforme a largura da tela. |

### 1.3 Regras Críticas de Estilização (Convivência com Tailwind v4 e shadcn/ui)
1. **Geometria Inline vs. Aparência em Classes:** Posição e tamanho nunca vão em classes CSS; aparência (fundo, bordas, raio, sombra, hover) nunca vai inline, ficando centralizada nas classes `.cpa-*`.
2. **Isolamento contra Utilitários Tailwind:** O projeto utiliza Tailwind v4 + shadcn/ui (preset *Vega*). Nenhuma tela utiliza classes de layout do Tailwind (`flex`, `grid`, `p-*`, `m-*`) para estruturar o palco, evitando sobrescrita de fontes, cores ou espaçamentos.
3. **Centralização Segura no Tailwind v4:** Como o Tailwind v4 utiliza a propriedade CSS `translate` para utilitários próprios:
   * Elementos comuns usam `.cpa-center` (`left: 50%; top: 50%; translate: -50% -50%`).
   * Modais (`DialogContent`) usam `inset: 0; margin: auto` combinado com `translate-x-0 translate-y-0` para anular o deslocamento padrão do shadcn.
4. **Especificidade Escopada:** Seletores como `.cpa-stage .cpa-btn` e `.cpa-modal .cpa-tag` garantem prioridade sobre os estilos padrão do Radix/shadcn. O uso de `!important` é restrito às dimensões externas dos modais.
5. **Interatividade sem Client-Side Desnecessário:** As páginas (`page.tsx`) são **Server Components**. Modais são disparados a partir de componentes servidor via `<DialogTrigger asChild>`, e a seleção de perguntas em `/resultados` funciona puramente com HTML/CSS (`<details>`, `<input type="radio">` e `:has()`).

---

## 2. O Que Existe em Cada Arquivo `.css`

O projeto possui **três arquivos CSS** em `src/app/`:

### 2.1 `src/app/cpa.css` (Folha Principal do Sistema)
Concentra praticamente todo o visual das telas do portal, dividido em blocos lógicos:

* **Tokens e Palco (`:root`, `.cpa-root`, `.cpa-stage`):**
  * **Cores institucionais:** `--cpa-navy` (`#012a55`), `--cpa-panel` (`#d9d9d9`), `--cpa-panel-light` (`#efefef`), `--cpa-line` (`#111111`), `--cpa-on-navy` (`#f4f6f9`), `--cpa-dot` (`#6df24a`).
  * **Cores de status e gráficos:** `--cpa-tag-negado` (`#f20000`), `--cpa-tag-analise` (`#ffeb00`), `--cpa-tag-concluido` (`#00e000`), `--cpa-bar-negado` (`#c40000`), `--cpa-bar-analise` (`#ffe600`), `--cpa-bar-concluido` (`#00c800`).
  * **Fundos por contexto:** gradiente multicor (ciano → azul → roxo → vermelho) no login; cinza-azulado (`#d8dde2`) no painel; cinza claro (`#f2f2f2`) nas telas internas.
* **Peças Comuns e Utilitários:**
  * `.cpa-center`: centralização absoluta no palco.
  * `.cpa-sr`: ocultação visual acessível apenas para leitores de tela (*screen readers*).
  * `.cpa-bar`: faixa institucional azul-marinho com bordas arredondadas (`12u`) e tipografia de cabeçalho (`36u`).
  * `.cpa-pill`: cápsula azul-marinho arredondada para títulos e saudações.
  * `.cpa-btn`, `.cpa-btn--line`, `.cpa-btn--ghost`: botões institucionais em azul-marinho, com borda clara (`--line`) ou fundo transparente (`--ghost`) e estados de hover/focus.
  * `.cpa-card`: superfície cinza (`--cpa-panel`) com borda escura (`--cpa-line`) usada nos cartões centrais de formulário.
  * `.cpa-label` e `.cpa-field`: rótulos e campos de entrada estilizados para substituir a aparência padrão do `<Input />`.
  * `.cpa-note`: caixa de aviso centralizada (usada na tela provisória `/pesquisa`).
* **Seção 1 — Tela de Login (`/login`):** Estilização do cartão de autenticação, alinhamento de rótulos e botão de entrada.
* **Seção 2 — Painel Principal (`/inicio`):**
  * `.cpa-home`: aplica a imagem de fundo `public/images/home-bg.jpg` (com fallback gráfico de círculo claro e faixa lateral caso a imagem ainda não exista).
  * `.cpa-profile`: pílula de exibição do perfil ativo + avatar circular.
  * `.cpa-banner` e `.cpa-dot`: faixa de status da pesquisa ativa e indicador luminoso circular.
* **Seção 3 — Central de Devolutivas (`/devolutivas`):**
  * `.cpa-panel`: container cinza principal da central.
  * `.cpa-search`: campo de busca em formato pílula (`raio 17u`) com ícone integrado.
  * `.cpa-years`: trilha de rolagem horizontal real com scrollbar customizada em formato de pílula (`26u` de altura).
  * `.cpa-year`, `.cpa-year-head`, `.cpa-year-title`: cartão clicável de cada ano e cabeçalho interno do gráfico de barras.
* **Seção 4 — Modal Mural de Devolutivas:**
  * `.cpa-modal`: janela modal de `662 × 370u`, centralizada com `inset: 0; margin: auto`.
  * `.cpa-m-scroll`, `.cpa-m-item`, `.cpa-m-text--short`: itens de manifestação (em destaque e recolhidos) e indicadores visuais.
* **Seção 5 — Resultados da Pesquisa CPA (`/resultados`):**
  * `.cpa-results`: container vertical rolável com scrollbar customizada.
  * `.cpa-cpa`: estilização do `<details>` e `<summary>` azul-marinho (`72u`) com rotação automática da seta indicadora quando `[open]`.
  * Grade interna de 3 colunas (`378fr 341fr 72u`, altura `294u`): `.cpa-res-chart`, `.cpa-lines` (lista rolável de respostas discursivas), `.cpa-res-list`, `.cpa-q` (itens de pergunta) e `.cpa-res-tools`.
  * Regras `:has(input[value="N"]:checked)` (suportando de 1 a 8 perguntas) que alternam o painel visível e destacam a pergunta selecionada sem JavaScript.
* **Seção 6 — Responder Devolutiva (`/devolutivas/responder`) e `/pesquisa`:**
  * Estilização nativa de `<select>` (com seta SVG embutida via `data-URI`) e `<textarea>` (`resize: none`), além do botão de envio.

### 2.2 `src/app/cpa-resposta.css` (Folha Complementar de Respostas e Etiquetas)
Arquivo dedicado aos estilos específicos adicionados na evolução do módulo de devolutivas:
* Estiliza o modal secundário **`RespostaDialog`** (exibição detalhada da resposta institucional: cabeçalho, metadados de área responsável, caixa de leitura da justificativa e botão de fechamento).
* Define as regras visuais do componente **`EtiquetaCategoria`** (pílula de status/categoria que recebe cor dinâmica via `hex` ou classe de status com contraste legível e borda padronizada), evitando conflitos com as regras do modal principal `.cpa-modal`.

### 2.3 `src/app/globals.css` (Base Tailwind v4 e Tokens shadcn/ui)
* Importa o Tailwind CSS v4 (`@import "tailwindcss"`) e define as variáveis CSS base do tema **shadcn/ui (preset Vega)** (`--background`, `--foreground`, `--radius`, `--ring`, etc.) e o reset base (`* { border-color: ... }`).
* **Papel no projeto:** Dá suporte estrutural aos primitivos Radix/shadcn (`Dialog` overlay/portal, foco acessível, `Badge`), mas **não contém regras de layout das telas**.

---

## 3. Catálogo de Componentes Criados

### 3.1 Componentes Compartilhados e de Tela Inicial (`src/components/`)

| Componente | Arquivo | Tipo | Responsabilidade e Estrutura Visual |
|---|---|---|---|
| `BarraInstitucional` | `barra-institucional.tsx` | Server | Renderiza a faixa azul-marinho (`.cpa-bar`) como `<header>`, `<footer>` ou `<div>`. Quando vazia, recebe `aria-hidden` (barra decorativa de topo/rodapé). Quando recebe `children`, atua como cabeçalho das páginas internas contendo o botão de voltar e o `<h1>` da tela. |
| `RedeDePontos` | `rede-de-pontos.tsx` | Server | SVG decorativo de tela cheia usado no fundo de `/login`. Desenha uma malha geométrica com 46 nós e linhas conectando pontos próximos (`< 150u`). |
| `LoginForm` | `login-form.tsx` | Client/Form | Cartão central (`.cpa-card.cpa-center`, `588 × 284u`) com título em pílula `"Login - CPA"`, campos `"E-Mail"` e `"Senha"` (`Label` + `Input.cpa-field`) e botão `"Entrar"` (`Button.cpa-btn--line`). |
| `HomeHeader` | `home-header.tsx` | Server | Cabeçalho flexível do painel (`/inicio`): botão voltar (`Undo2`), botão informativo `"i"`, pílula de saudação (`"Seja bem vindo, [Usuário]!"`) e badge de perfil ativo com ícone `UserRound`. |
| `StatusPesquisa` | `status-pesquisa.tsx` | Server | Bloco central do painel (`/inicio`, `782 × 223u`): banner de status da pesquisa (`"Pesquisa CPA 2026/2 Aberta"` + ponto `.cpa-dot`) e fileira com até 4 botões de ação (Acessar, Devolutivas, Resultados e Responder Devolutiva). |

### 3.2 Módulo de Devolutivas (`src/components/devolutivas/`)

| Componente | Arquivo | Tipo | Responsabilidade e Estrutura Visual |
|---|---|---|---|
| `PainelDevolutivas` | `painel-devolutivas.tsx` | Client | Painel cinza principal (`.cpa-panel`) de `/devolutivas`. Contém o campo de busca (`#busca-devolutivas`) e a trilha horizontal rolável (`.cpa-years`) com os cartões de cada ano. |
| `CartaoAno` | `cartao-ano.tsx` | Server | Conteúdo interno de cada botão de ano (`.cpa-year`): faixa superior com o ano (`.cpa-year-head`), subtítulo `"Número de Sugestões por Tipo de Deferimento"` e o componente `GraficoStatus`. |
| `GraficoStatus` | `grafico-status.tsx` | Server | Gráfico de 3 barras verticais (`Não Procedidas` em vermelho, `Em Análise` em amarelo, `Procedidas` em verde), com o valor numérico acima de cada barra e altura proporcional (`contagem × 17u`, mínimo `3u`). |
| `MuralDialog` | `mural-dialog.tsx` | Client | Modal (`DialogContent.cpa-modal`, `662 × 370u`) aberto ao clicar em um cartão de ano. Exibe o título `"Mural de Devolutivas"`, uma manifestação em destaque e manifestações recolhidas abaixo, cada uma com sua `EtiquetaCategoria` e gatilho para `RespostaDialog`. |
| `RespostaDialog` | `resposta-dialog.tsx` | Client | Modal secundário (estilizado via `cpa-resposta.css`) acionado a partir de uma manifestação no Mural para exibir os detalhes completos da devolutiva institucional (título, área responsável, categoria e justificativa). |
| `EtiquetaCategoria` | `etiqueta-categoria.tsx` | Server | Pílula visual (`Badge` / `.cpa-tag`) que exibe o rótulo de deferimento/categoria (`Não Procede`, `Pedido em Análise`, `Concluído`, etc.) com cor de fundo correspondente. |
| `FormResposta` | `form-resposta.tsx` | Client/Form | Cartão de formulário (`640 × 360u`) de `/devolutivas/responder` com selects nativos (`Área responsável` e `Categoria da resposta`), `textarea` (`Motivo da resposta`) e botão `"Enviar resposta"`. |

### 3.3 Módulo de Resultados (`src/components/resultados/`)

| Componente | Arquivo | Tipo | Responsabilidade e Estrutura Visual |
|---|---|---|---|
| `CartaoCpa` | `cartao-cpa.tsx` | Server | Acordeão nativo (`<details class="cpa-cpa">`) representando uma edição da CPA (ex.: `CPA - 2026/2`). Ao expandir, organiza 3 colunas: área de visualização (gráfico ou lista de respostas), menu lateral de perguntas (rádios ocultos) e barra de ferramentas (`Baixar resultados` e `Ver relatório`). |
| `GraficoPizza` | `grafico-pizza.tsx` | Server | Gráfico de setores em SVG (`viewBox="0 0 378 234"`, centro `(193, 121)`, raio `74`). Desenha fatias coloridas para as alternativas (`A` a `E`), exibe percentuais internos (quando `>= 4%`) e conecta letras externas em elipses por meio de setas. |

### 3.4 Primitivos UI (`src/components/ui/`)
* **Em uso ativo:** `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`.
* **Instalados (disponíveis no preset Vega):** `scroll-area.tsx`.

---

## 4. Disposição dos Componentes por Página

### 4.1 `/` (`src/app/page.tsx`)
* **Composição:** Não renderiza interface; executa `redirect("/login")`.

### 4.2 `/login` — Tela de Autenticação (`src/app/login/page.tsx`)
* **Fundo:** Gradiente multicor aplicado no `.cpa-stage` + `<RedeDePontos />` ocupando todo o fundo.
* **Disposição hierárquica e coordenadas (`960 × 540u`):**
  1. `<BarraInstitucional as="header" />` — `band({ left: 14, right: 14, top: 22, h: 68 })` (faixa superior decorativa).
  2. `<LoginForm />` — `588 × 284u`, centralizado (`.cpa-center`):
     * Título `<h1>` `"Login - CPA"`: `box(226, 12, 131, 48)` (`.cpa-pill`, raio `24u`).
     * Rótulo `"E-Mail"`: `box(75, 84, 94, 30)` | Campo `#email`: `box(198, 84, 307, 30)`.
     * Rótulo `"Senha"`: `box(75, 151, 94, 30)` | Campo `#senha`: `box(198, 151, 307, 30)`.
     * Botão `"Entrar"`: `box(226, 218, 131, 49)` (raio `25u`).
  3. `<BarraInstitucional as="footer" />` — `band({ left: 14, right: 14, bottom: 21, h: 68 })` (faixa inferior decorativa).

### 4.3 `/inicio` — Painel Principal (`src/app/inicio/page.tsx`)
* **Fundo:** Classe `.cpa-home` (`public/images/home-bg.jpg` ou fallback gráfico).
* **Disposição hierárquica e coordenadas:**
  1. `<HomeHeader />` — `band({ left: 43, right: 0, top: 21, h: 60 })` (container `flex` horizontal):
     * Botão Voltar (`Undo2` → `/login`): `size(58, 52)` (raio `26u`).
     * Botão Informação (`"i"`): `size(54, 44)` (raio `12u`, espaçamento `37u` do voltar).
     * Pílula de Saudação (`<h1>`): `flex: 1`, altura `60u`, raio `30u` (espaçamento `28u` do `"i"`).
     * Bloco de Perfil (`.cpa-profile`): `size(185, 60)` (espaçamento `21u` da saudação, contém rótulo do perfil + avatar `UserRound`).
  2. `<StatusPesquisa />` — `782 × 223u`, centralizado horizontalmente e deslocado `39.5u` abaixo do centro vertical:
     * Banner de Status (`.cpa-banner`): `box(0, 0, 782, 93)` — texto `"Pesquisa CPA 2026/2 Aberta"` (`42u`) + indicador `.cpa-dot`.
     * Botão `"Acessar"` (com seta tracejada SVG): `box(50, 148, 196, 72)` (raio `28u`).
     * Botão Devolutivas (ícone envelope → `/devolutivas`): `box(286, 144, 122, 79)` (raio `28u`).
     * Botão Resultados (ícone gráfico → `/resultados`, `data-somente="administrador"`): `box(448, 144, 122, 79)` (raio `28u`).
     * Botão Responder Devolutiva (ícone balão → `/devolutivas/responder`, `data-somente="administrador"`): `box(610, 144, 122, 79)` (raio `28u`).
  3. `<BarraInstitucional as="footer" />` — `band({ left: 21, right: 21, bottom: 22, h: 60 })`.

### 4.4 `/pesquisa` — Formulário da Pesquisa (`src/app/pesquisa/page.tsx`)
* **Fundo:** Cinza claro (`#f2f2f2`).
* **Disposição hierárquica e coordenadas:**
  1. `<BarraInstitucional as="header">` — `band({ left: 10, right: 10, top: 13, h: 68 })` com botão voltar (`ArrowLeft` → `/inicio`, `box(34, 17, 40, 34)`) e título `"Pesquisa CPA 2026/2"`.
  2. `<p className="cpa-note cpa-center">` — `600 × 40u`, centralizado, exibindo o aviso provisório da área de construção da pesquisa.

### 4.5 `/devolutivas` — Central de Devolutivas e Modais (`src/app/devolutivas/page.tsx`)
* **Fundo:** Cinza claro (`#f2f2f2`).
* **Disposição hierárquica e coordenadas:**
  1. `<BarraInstitucional as="header">` — `band({ left: 10, right: 10, top: 13, h: 68 })` com botão voltar (`box(34, 17, 40, 34)`) e título `"Central de Devolutivas"`.
  2. `<PainelDevolutivas />` — `band({ left: 14, right: 14, top: 96, bottom: 72 })` (`.cpa-panel`, raio `12u`):
     * Barra de busca (`.cpa-search`): `box(18, 14, 210, 34)` (ícone `Search` + `Input#busca-devolutivas`).
     * Fileira de anos (`.cpa-years`): `band({ left: 18, right: 18, top: 58, h: 300 })` (rolagem horizontal com `gap: 20u`).
     * Dentro de `.cpa-years`: cada ano é um gatilho `<MuralDialog>` envolvendo um `<CartaoAno />` (com `<GraficoStatus />`).
  3. **Camada de Modais (sobreposta ao clicar em um ano):**
     * `<MuralDialog />` (`662 × 370u`, centralizado):
       * Título `"Mural de Devolutivas"`: `box(43, 15, 577, 53)`.
       * Item em destaque (`.cpa-m-item`): `box(43, 92, 577, 135)` contendo texto (`box(22, 13, 544, 85)`), `<EtiquetaCategoria />` no canto inferior direito e botão/gatilho para `<RespostaDialog />`.
       * Itens recolhidos: `box(43, 234, 577, 61)` e `box(43, 299, 577, 60)` com texto curto (`box(14, 5, 311, 35)`) e `<EtiquetaCategoria />` à direita (`top: 19u`).
     * `<RespostaDialog />`: abre sobre o Mural ao inspecionar a resposta institucional de uma manifestação.
  4. `<BarraInstitucional as="footer" />` — `band({ left: 14, right: 14, bottom: 14, h: 44 })`.

### 4.6 `/resultados` — Resultados da Pesquisa CPA (`src/app/resultados/page.tsx`)
* **Fundo:** Cinza claro (`#f2f2f2`).
* **Disposição hierárquica e coordenadas:**
  1. `<BarraInstitucional as="header">` — `band({ left: 10, right: 10, top: 13, h: 68 })` com botão voltar (`box(34, 17, 40, 34)`) e título `"Resultados da Pesquisa CPA"`.
  2. Lista rolável `.cpa-results` — `band({ left: 32, right: 22, top: 100, bottom: 16 })`:
     * Contém uma lista vertical de `<CartaoCpa />` (uma por período/semestre, com a mais recente aberta por padrão).
     * **Estrutura interna de cada `<CartaoCpa />`:**
       * `<summary>` azul-marinho (`72u` de altura) com título `"CPA - {período}"` (`30u`) e seta SVG.
       * Corpo expandido (`294u` de altura, grade `378fr 341fr 72u`):
         1. **Coluna 1 (Visualização, `234u` de altura):** exibe `<GraficoPizza />` para perguntas objetivas ou `<ul className="cpa-lines">` para perguntas discursivas.
         2. **Coluna 2 (Seletor de Perguntas, `.cpa-res-list`):** lista rolável de `<label className="cpa-q">` (`44u` de altura cada).
         3. **Coluna 3 (Ferramentas, `.cpa-res-tools`):** botões fantasma de `30u` para `Baixar resultados` (`Download`) e `Ver relatório` (`FileText`).

### 4.7 `/devolutivas/responder` — Responder Devolutiva (`src/app/devolutivas/responder/page.tsx`)
* **Fundo:** Cinza claro (`#f2f2f2`).
* **Disposição hierárquica e coordenadas:**
  1. `<BarraInstitucional as="header">` — `band({ left: 10, right: 10, top: 13, h: 68 })` com botão voltar (`box(34, 17, 40, 34)`) e título `"Responder Devolutiva"`.
  2. `<FormResposta />` — `640 × 360u`, centralizado e deslocado `24u` abaixo do centro vertical:
     * Rótulo `"Área responsável"`: `box(24, 20, 290, 22)` | `<select id="area">`: `box(24, 44, 290, 34)`.
     * Rótulo `"Categoria da resposta"`: `box(326, 20, 290, 22)` | `<select id="categoria">`: `box(326, 44, 290, 34)`.
     * Rótulo `"Motivo da resposta"`: `box(24, 98, 592, 22)` | `<textarea id="motivo">`: `box(24, 122, 592, 150)`.
     * Botão `"Enviar resposta"`: `box(220, 292, 200, 44)`.

---

## 5. Checklist de Preservação Visual para Novas Conversas

Ao solicitar alterações ou conexões com o back-end em novas sessões, mantenha estas diretrizes no contexto:
1. **Não substituir `cpa-box.ts` por classes Tailwind:** Qualquer novo elemento dentro de `.cpa-stage` deve usar `box()`, `size()` ou `band()` para manter a escala proporcional `--u`.
2. **Modais:** Todo novo `DialogContent` deve receber `className="cpa-modal translate-x-0 translate-y-0"` (ou equivalente em `cpa-resposta.css`) para não sofrer deslocamento pelo Tailwind v4.
3. **Arquivos de Dados Mockados:** Os contratos visuais atuais consomem tipos definidos em `src/lib/devolutivas-data.ts` e `src/lib/resultados-data.ts`; ao conectar o Prisma 7, mantenha a compatibilidade de props dos componentes de exibição (`CartaoAno`, `GraficoStatus`, `MuralDialog`, `RespostaDialog`, `CartaoCpa`, `GraficoPizza`).
4. **Registro de Alterações:** Conforme padrão do projeto, toda modificação estrutural ou visual deve ser documentada em `docs/registros/NNNN-assunto.md` e indexada em `docs/registros/INDEX.md`.