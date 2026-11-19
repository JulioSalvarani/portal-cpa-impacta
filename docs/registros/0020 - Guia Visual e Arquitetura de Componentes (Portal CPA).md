# Registro nº 0020 — Guia Visual e Arquitetura de Componentes (Portal CPA)

| Campo | Valor |
|---|---|
| **Número** | 0020 |
| **Data da alteração** | 17/11/2026 (America/Sao_Paulo) |
| **Tipo** | Consolidação definitiva (Sistema visual, componentes, modais e responsividade) |
| **Substitui** | `019 - guia_visual_e_arquitetura_de_componentes_portal_cpa.md` |
| **Estado do projeto** | Front-end 100% finalizado e validado (7 rotas ativas + 3 modais), alinhado aos 4 perfis RBAC e aos embeds do Data Studio |
| **Próximo registro livre** | **0021** |

---

## 1. Visão Geral do Sistema Visual

O **Portal CPA (Comissão Própria de Avaliação — Faculdade Impacta)** utiliza uma arquitetura visual híbrida:
1. **Primitivos de acessibilidade e interação:** componentes **shadcn/ui** (Radix UI, preset Vega) em `src/components/ui/`.
2. **Geometria e estilização proprietárias:** sistema de escala proporcional baseado em uma tela de referência **`960 × 540`** (proporção `16:9`), controlado exclusivamente por CSS puro (`src/app/cpa.css` e `src/app/cpa-resposta.css`) e helpers geométricos (`src/lib/cpa-box.ts`).

### Regras Obrigatórias de Estilização
* **Nunca utilizar classes utilitárias do Tailwind CSS** (`flex`, `p-4`, `text-lg`, `bg-*`, etc.) para posicionar ou estilizar componentes internos das telas.
* Toda posição e dimensão no desktop deve usar os helpers de `src/lib/cpa-box.ts` (`u()`, `box()`, `size()`, `band()`), e toda aparência visual (cores, bordas, tipografia, estados e media queries) deve residir em `src/app/cpa.css` e `src/app/cpa-resposta.css`.
* Nos modais (`DialogContent`), manter sempre `className="cpa-modal translate-x-0 translate-y-0"` (e `cpa-modal--resposta` no segundo modal) para anular o posicionamento centralizado padrão do Tailwind v4.
* Ao estilizar o botão fechar nativo do shadcn Dialog, sempre qualificar com `[data-slot="dialog-close"]` para não afetar o container do modal nem botões internos.

---

## 2. Tokens Visuais, Tipografia e Escala (`--u`)

### 2.1 Tipografia (`src/app/layout.tsx`)
* Fonte principal: **`Share Tech Mono`** carregada via `next/font/google` na variável CSS `--font-ui` (`weight: "400"`, `subsets: ["latin"]`), com fallback `"Share Tech Mono", ui-monospace, monospace` em `--cpa-mono`.
* Idioma raiz configurado como `<html lang="pt-BR">`.

### 2.2 Unidade Proporcional `--u` (`src/app/cpa.css`)
```css
:root {
  --u: min(calc(100vw / 960), calc(100vh / 540));
  --cpa-navy: #012a55;
  --cpa-on-navy: #ffffff;
  --cpa-panel: #d9d9d9;
  --cpa-field: #efefef;
  --cpa-line: #000000;
  --cpa-dot-open: #6df24a;
  --cpa-dot-closed: #f20000;
  --cpa-bar-deferido: #0ee80e;
  --cpa-bar-analise: #f3ef00;
  --cpa-bar-negado: #f20000;
}
```
* **Palco Desktop (`.cpa-stage`):** `width: calc(960 * var(--u))`, `height: calc(540 * var(--u))`, centralizado em `.cpa-root` (`100dvh`) com fundo institucional em camada dedicada (`.cpa-bg` + marca d'água circular central).
* **Adaptação Responsiva (`@media (max-width: 768px)`):**
  * `.cpa-root` libera `height: auto`, `min-height: 100dvh` e `overflow-y: auto`.
  * `.cpa-stage` converte-se em container vertical fluido (`width: 100%`, `height: auto`, `display: flex`, `flex-direction: column`, `gap: 12px`, `padding: 12px`), redefinindo `--u: 1px` e convertendo os filhos posicionados em blocos empilhados legíveis em dispositivos móveis.

### 2.3 Helpers Geométricos (`src/lib/cpa-box.ts`)
| Helper | Assinatura | Finalidade |
|---|---|---|
| `u(n)` | `(n: number) => string` | Converte unidades de design em `calc(${n} * var(--u))`. |
| `box(x, y, w, h, extra?)` | `(x, y, w, h, extra?) => CSSProperties` | Posicionamento absoluto (`left`, `top`, `width`, `height`) dentro de `.cpa-stage` ou `.cpa-modal`. |
| `size(w, h, extra?)` | `(w, h, extra?) => CSSProperties` | Define apenas `width` e `height` (usado em itens de fluxo flex/grid). |
| `band({ left?, right?, top?, bottom?, h?, extra? })` | `(opts) => CSSProperties` | Posiciona faixas horizontais ancoradas nas bordas do palco (cabeçalhos, rodapés e painéis). |

---

## 3. Árvore de Arquivos e Catálogo de Componentes

### 3.1 Arquivos de Estilo e Utilitários
* `src/app/layout.tsx`: configura `Share Tech Mono` (`--font-ui`) e metadados globais.
* `src/app/cpa.css`: folha principal com palco, fundo, botões, formulários, cabeçalho `/inicio`, modal de contato `"i"`, painel de devolutivas, mural uniforme de 2 linhas, acordeões de resultados/embeds, painel de relatórios, listagem de perfis e `@media (max-width: 768px)`.
* `src/app/cpa-resposta.css`: estilos específicos do segundo modal (`RespostaDialog` — `.cpa-modal--resposta`), botões `"Ver resposta"`, rótulos internos e área rolável da justificativa.
* `src/lib/cpa-box.ts`: helpers de conversão proporcional (`u`, `box`, `size`, `band`).

### 3.2 Componentes Compartilhados (`src/components/`)
| Componente | Arquivo | Tipo | Responsabilidade Visual |
|---|---|---|---|
| `BarraInstitucional` | `src/components/barra-institucional.tsx` | Server | Faixa azul-marinho (`#012a55`, `border-radius: 10u`) usada como `<header>` (`68u`) e `<footer>` (`44u`) nas telas internas, com botão `ArrowLeft` opcional. |
| `HomeHeader` | `src/components/home-header.tsx` | Client | Cabeçalho de `/inicio` (`band({ left: 43, right: 0, top: 21, h: 60 })`):<br>• Botão esquerdo circular vermelho no hover (`.cpa-btn.cpa-logout`, `58 × 52u`) com ícone **`LogOut`** (`lucide-react`) para encerrar sessão (`logoutAction` ou link `/login` no protótipo).<br>• Botão `"i"` (`54 × 44u`) que dispara `ContatoInfoDialog`.<br>• Pílula central de saudação (`Seja bem vindo, {nome}!`).<br>• Cartão de perfil direito (`.cpa-profile`, `185 × 60u`) exibindo o cargo ativo (`Aluno`, `Coordenador`, `Avaliador Ext.`, `Administrador`) + ícone `UserRound`. |
| `ContatoInfoDialog` | `src/components/contato-info-dialog.tsx` | Client | Modal institucional (`620 × 350u`) aberto pelo botão `"i"`: apresenta a finalidade da CPA, o e-mail `cpa@impacta.edu.br` e botões externos para **Google Chats** e **Google Meet**. |
| `StatusPesquisa` | `src/components/status-pesquisa.tsx` | Client | Bloco central de `/inicio`:<br>• Banner da edição (`583 × 72u`) + ponto de status `.cpa-dot` (`23 × 23u` — verde `#6df24a` se `isActive === true`, vermelho `#f20000` se `false`).<br>• Botão **Acessar** (`146 × 60u`): abre `formLink` (Google Forms) em nova aba; aplica `.cpa-btn--disabled` quando encerrada.<br>• Fileira de navegação condicionada por `role`: **4 botões** (`Acessar`, `Devolutivas`, `Resultados`, `Relatórios`) para `aluno`, `coordenador` e `avaliador_externo`; **6 botões** (adicionando `Responder` e `Perfis` com ícone **`UserCog`**) para `admin`. |
| `LoginForm` | `src/components/login-form.tsx` | Client | Formulário dentro do cartão `.cpa-card` (`583 × 300u`) de `/login`: campos `E-Mail` (`#email`) e `Senha` (`#senha`, **sem placeholder** para visual limpo), slot de erro discreto (`.cpa-form-error`) e botão `Entrar` (`131 × 49u`). |

### 3.3 Componentes de Domínio
* **Devolutivas (`src/components/devolutivas/`):**
  * `PainelDevolutivas` (`painel-devolutivas.tsx`): painel cinza sem barra de busca, com trilha horizontal rolável (`.cpa-years`) de cartões anuais.
  * `CartaoAno` (`cartao-ano.tsx`): cartão por ano (`270 × 310u`) com título `CPA - {ano}`, subtítulo e gráfico de barras `GraficoStatus`.
  * `GraficoStatus` (`grafico-status.tsx`): renderiza as barras verticais proporcionais com as cores hexadecimais de cada categoria (`Resolvido`, `Inapto`, `Impertinente`).
  * `MuralDialog` (`mural-dialog.tsx`): modal (`662 × 370u`) com título e lista simétricos (`box(43, 15, 576, 53)` e `box(43, 82, 576, 272)`), botão fechar `×` centralizado no vão esquerdo (`top: 29.5u, left: 10u, 24 × 24u`), rolagem vertical real (`.cpa-m-list`), **cards uniformes** (`min-height: 64u`) com título limitado a **2 linhas** (`-webkit-line-clamp: 2`), botão **Ver resposta** e etiqueta de status com largura uniforme (`min-width: 132u`).
  * `RespostaDialog` (`resposta-dialog.tsx`): segundo modal (`560 × 330u`, `.cpa-modal--resposta`) com botão fechar `×` ajustado à esquerda (`top: 24u, left: 4u, 22 × 22u` via `[data-slot="dialog-close"]`), exibindo `Título` (1 linha), `Área responsável` (1 linha + badge) e `Justificativa` (caixa com rolagem vertical `.cpa-m-text--scroll`).
  * `FormResposta` (`form-resposta.tsx`): formulário administrativo (`640 × 360u`) com campos `Título`, `Área responsável`, `Categoria` e `Motivo` (justificativa).
  * `EtiquetaCategoria` (`etiqueta-categoria.tsx`): badge arredondado colorido conforme status.
* **Resultados (`src/components/resultados/`):**
  * `CartaoCpa` (`cartao-cpa.tsx`): acordeão expansível representando cada um dos 4 públicos da CPA (*Alunos do Presencial*, *Alunos do EAD*, *Professores*, *Corpo Técnico Administrativo*). Quando aberto, exibe aviso sobre autenticação Google `@impacta` (ou acesso externo para `avaliador_externo`) e container rolável (`.cpa-embed-scroll`) para o `<iframe>` do Google Data Studio / Looker Studio (que fornece nativamente os filtros `ANO`, `Semestre`, `Ciclo` e `Download`).
* **Relatórios (`src/components/relatorios/`):**
  * `PainelRelatorios` (`painel-relatorios.tsx`): abas de filtro (*Todos*, *Relatório de Autoavaliação*, *Boletim Informativo*), formulário superior de upload exibido **apenas** quando `isAdmin = true` e lista rolável com botão de download direto de PDFs.
* **Perfis (`src/components/perfis/`):**
  * `TabelaPerfis` (`tabela-perfis.tsx`): lista rolável de usuários (`nome`, `email`) com `<select class="cpa-select">` para alternar entre os 4 perfis oficiais (`aluno`, `coordenador`, `avaliador_externo`, `admin`) e botão de confirmação (`Salvar` → `✓ Salvo`).

---

## 4. Mapa de Rotas e Coordenadas por Tela

| Rota | Arquivo | Estrutura Visual e Coordenadas Principais (`960 × 540u`) |
|---|---|---|
| `/` | `src/app/page.tsx` | Redireciona para `/login` (ou `/inicio` quando autenticado via `src/middleware.ts`). |
| `/login` | `src/app/login/page.tsx` | Cartão centralizado `.cpa-card.cpa-center` (`583 × 300u`), título `Login - CPA` (`top: 21u`), formulário `LoginForm`. |
| `/inicio` | `src/app/inicio/page.tsx` | `HomeHeader` (`top: 21u, h: 60u`) + `StatusPesquisa` (banner em `top: 212u`, fileira de botões em `top: 344u`). |
| `/pesquisa` | `src/app/pesquisa/page.tsx` | Redireciona para `/inicio` (a pesquisa ativa é respondida externamente via `cpas.form_link`). |
| `/devolutivas` | `src/app/devolutivas/page.tsx` | `BarraInstitucional` header (`top: 13u, h: 68u`), `PainelDevolutivas` (`band({ left: 14, right: 14, top: 96, bottom: 72 })`), `BarraInstitucional` footer (`bottom: 14u, h: 44u`). |
| `/devolutivas/responder` | `src/app/devolutivas/responder/page.tsx` | `BarraInstitucional` header + cartão `.cpa-card` (`640 × 360u`) com `FormResposta` + `BarraInstitucional` footer. |
| `/resultados` | `src/app/resultados/page.tsx` | `BarraInstitucional` header + lista rolável `.cpa-results` (`band({ left: 14, right: 14, top: 96, bottom: 72 })`) com acordeões `CartaoCpa` + `BarraInstitucional` footer. |
| `/relatorios` | `src/app/relatorios/page.tsx` | `BarraInstitucional` header + `.cpa-panel` com `PainelRelatorios` + `BarraInstitucional` footer. |
| `/perfis` | `src/app/perfis/page.tsx` | `BarraInstitucional` header + `.cpa-panel` com `TabelaPerfis` + `BarraInstitucional` footer. |

---

## 5. Arquivos Obsoletos / Substituídos

Os arquivos abaixo pertenciam ao protótipo inicial (gráficos nativos e dados fictícios) e foram substituídos por `src/lib/dashboards-data.ts` e pelos embeds do Google Data Studio:
* `src/lib/resultados-data.ts` (sem uso — foi removido)
* `src/components/resultados/grafico-pizza.tsx` (sem uso — foi removido)