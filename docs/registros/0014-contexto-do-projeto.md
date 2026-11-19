# Registro nº 0014 — Contexto completo do projeto (para iniciar novas conversas)

| Campo | Valor |
|---|---|
| **Número** | 0014 |
| **Data da alteração** | 12/11/2026, 06:10 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Atualizado em** | 16/11/2026, 00:30 (America/Sao_Paulo), registro 0017 (antes: 0016 e 0015) |
| **Estado do projeto descrito** | Registros 0001 a 0017 |
| **Finalidade** | Documento de contexto: permite a uma nova conversa entender o projeto e começar a implementar funcionalidades |

> **Como usar:** cole este arquivo (ou anexe-o) no início da nova conversa. A seção 13 tem um texto pronto para abrir a conversa.

---

## 1. O que é o projeto

**Portal CPA — Faculdade Impacta.** Portal web da Comissão Própria de Avaliação (CPA): centraliza dashboards das pesquisas institucionais, mural de devolutivas e relatórios, com controle de acesso por perfil.

- **Perfis (a implementar):** inicialmente só **Aluno** e **Coordenação** (registro 0017); o projeto prevê também administrador e avaliador externo, para depois. As contas são criadas pela instituição a partir de um banco interno já existente (não é preocupação do projeto) e a tabela `roles` define permissões e visualização: **aluno não acessa** "Resultados da Pesquisa CPA" nem "Responder Devolutiva"; **coordenação acessa tudo**.
- **Estado atual:** **protótipo somente visual**. Todas as telas existem, com o visual aprovado contra o mockup, mas **não há nenhuma funcionalidade**: sem login real, sem sessão, sem busca, sem dados reais, sem envio de formulário. Os botões só navegam entre telas. A implementação das funções fica com o usuário (com apoio nas próximas conversas).
- **Idioma:** interface e comentários em português (pt-BR). Fonte da interface: **Share Tech Mono**.

## 2. Stack e ambiente

| Item | Situação |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Componentes | shadcn/ui (Radix UI, preset Vega); ícones `lucide-react` |
| Estilo das telas | **CSS puro** em `src/app/cpa.css` (não usa Tailwind nem `globals.css`) |
| Gerenciador | pnpm ou npm (`dev`, `build`, `start`, `lint`) |
| Banco de dados | **Supabase (PostgreSQL)** com **Prisma 7** (`@prisma/client@7`, adaptador `@prisma/adapter-pg@7` + `pg`), schemas `public` e `auth` (registro 0015; seção 12) |
| Autenticação (prevista) | Supabase Auth + tabelas `profiles` e `roles` (ainda não ligadas às telas) |

**Atenção a divergências:** o `package.json` e o `components.json` que existem na cópia de trabalho do assistente são de um scaffold anterior (Tailwind 3, shadcn "default") e **não representam o projeto real do usuário**. O projeto real foi recriado com a CLI do shadcn depois do registro 0007 (provavelmente **Tailwind v4**, Next mais recente). Em caso de dúvida, vale o projeto do usuário. Isso é a razão de o visual não depender do Tailwind: em Tailwind v4 a propriedade CSS `translate` é usada por utilitários, por isso não se combina `transform` com `translate` para centralizar elementos.

O código **nunca foi compilado nem executado no Next** pelo assistente (ambiente sem rede). O visual foi verificado renderizando os componentes reais em navegador com versões simplificadas de shadcn, `Link` e ícones. Erros no primeiro `pnpm dev` devem ser corrigidos e registrados.

## 3. Regra de documentação (obrigatória)

Toda criação ou alteração gera um arquivo em `docs/registros/NNNN-assunto.md` com **número sequencial, data e hora (America/Sao_Paulo), tipo (Criação/Atualização), o que mudou e arquivos afetados**, mais uma linha em `docs/registros/INDEX.md`. Atualizar um Markdown existente também gera novo registro. **Próximo número livre: 0018.**

| Nº | Assunto |
|---|---|
| 0001 | Estrutura base do projeto |
| 0002 | Tela de Login |
| 0003 | Painel principal |
| 0004 | Central de Devolutivas |
| 0005 | Modal Mural de Devolutivas |
| 0006 / 0007 | README e índice de registros |
| 0008 | Protótipo visual HTML das 4 telas (mockup de referência, moldura 960 × 540) |
| 0009 | Protótipo visual em Next |
| 0010 | Visual com CSS próprio, fiel ao mockup 008 |
| 0011 | Tela cheia, barra de rolagem real, modal centralizado |
| 0012 | Páginas de administrador: Resultados e Responder Devolutiva |
| 0013 | Consolidação das páginas de administrador |
| 0014 | Este documento |
| 0015 | Supabase + Prisma 7 e ajustes do usuário (modal centralizado, áreas reais) |
| 0016 | Respostas do usuário ao 0015; botão "Ver resposta" + janela de justificativa; campo Título na resposta; etiquetas de categoria vindas do banco |
| 0017 | Devolutivas no lugar de "manifestações"; categorias únicas (Impertinente, Inapto, Resolvido) para etiquetas, barras e dropdown; Google Forms; só Aluno e Coordenação; proposta de banco |

## 4. Mapa de rotas

| Rota | Arquivo | Tela | Acesso previsto |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Redireciona para `/login` | todos |
| `/login` | `src/app/login/page.tsx` | Login - CPA | público |
| `/inicio` | `src/app/inicio/page.tsx` | Painel principal | autenticados |
| `/pesquisa` | `src/app/pesquisa/page.tsx` | Pesquisa CPA (**provisória**, só um aviso) | aluno (e quem responder) |
| `/devolutivas` | `src/app/devolutivas/page.tsx` | Central de Devolutivas + modal Mural | autenticados |
| `/resultados` | `src/app/resultados/page.tsx` | Resultados da Pesquisa CPA | **restrita por perfil** (aluno não acessa) |
| `/devolutivas/responder` | `src/app/devolutivas/responder/page.tsx` | Responder Devolutiva | **restrita por perfil** (aluno não acessa) |

**Navegação atual:** login → `Entrar` → `/inicio`. Em `/inicio`: `Acessar` → `/pesquisa`; envelope → `/devolutivas`; gráfico → `/resultados`; mensagem → `/devolutivas/responder`; voltar → `/login`. Nas demais telas o botão de voltar leva a `/inicio`. Clique em um card de ano em `/devolutivas` abre o modal Mural.

**Restrição por perfil não existe.** Qualquer pessoa chega a `/resultados` e `/devolutivas/responder` pela URL.

## 5. Estrutura de arquivos

```
src/
  app/
    layout.tsx                  fonte Share Tech Mono (variável --font-ui), lang pt-BR
    page.tsx                    redirect → /login
    cpa.css                     TODO o visual das telas (ver seção 6)
    globals.css                 do scaffold; as telas não dependem dele
    login/page.tsx
    login/actions.ts            (não usado) action de login do scaffold antigo
    inicio/page.tsx
    pesquisa/page.tsx
    devolutivas/page.tsx
    devolutivas/responder/page.tsx
    resultados/page.tsx
  components/
    barra-institucional.tsx     faixa azul-marinho (header/footer/div)
    rede-de-pontos.tsx          fundo decorativo SVG do login
    login-form.tsx              campos e botão do login
    home-header.tsx             cabeçalho do painel
    status-pesquisa.tsx         banner da pesquisa + 4 botões do painel
    devolutivas/
      painel-devolutivas.tsx    cabeçalho, busca e fileira de anos
      cartao-ano.tsx            conteúdo de um card de ano
      grafico-status.tsx        gráfico de 3 barras (uma por categoria da resposta)
      etiqueta-categoria.tsx    etiqueta com texto e cor da categoria (do banco)
      resposta-dialog.tsx       botão "Ver resposta" + janela da justificativa
      mural-dialog.tsx          modal Mural de Devolutivas
      form-resposta.tsx         formulário de responder devolutiva
    resultados/
      cartao-cpa.tsx            dropdown (details) de uma CPA
      grafico-pizza.tsx         pizza SVG A–E
    ui/                         shadcn: badge, button, card, dialog, input, label, scroll-area
    cpa-page.tsx, cpa-fonte.ts  (SOLTOS, sem uso)
  lib/
    cpa-box.ts                  helpers de posicionamento (seção 6)
    devolutivas-data.ts         tipos e dados de exemplo das devolutivas
    resultados-data.ts          tipos e dados de exemplo dos resultados
    perfis.ts, auth-mock.ts, session.ts   (NÃO usados) esboço de perfis/sessão do scaffold antigo
    utils.ts                    cn() do shadcn
  middleware.ts                 pass-through (não faz nada)
  styles/cpa.css                (SOLTO, sem uso)
docs/registros/                 registros 0001–0015 + INDEX.md
prisma/schema.prisma            (só no projeto do usuário) schema puxado do Supabase
prisma7.config.ts               (só no projeto do usuário) URL da CLI do Prisma; dotenv
src/lib/prisma.ts               (só no projeto do usuário) singleton do PrismaClient com PrismaPg
src/generated/prisma/           (só no projeto do usuário) client gerado
public/images/home-bg.jpg       FOTO DE FUNDO DO PAINEL: ainda precisa ser colocada pelo usuário
```

## 6. Sistema visual (como o CSS funciona)

**Tokens** (`:root` em `cpa.css`):

| Token | Valor | Uso |
|---|---|---|
| `--u` | `min(100vw/960, 100vh/540)` | 1 px do mockup, ajustado à janela |
| `--cpa-navy` | `#012a55` | barras, botões, banner, título de CPA |
| `--cpa-panel` | `#d9d9d9` | cartões e painéis cinza |
| `--cpa-panel-light` | `#efefef` | busca, trilho da barra de rolagem |
| `--cpa-line` | `#111111` | bordas e texto sobre cinza |
| `--cpa-on-navy` | `#f4f6f9` | texto sobre azul-marinho |
| `--cpa-dot` | `#6df24a` | ponto verde "pesquisa aberta" |
| `--cpa-tag-*` e `--cpa-bar-*` | (sem uso desde o 0017) | as cores de etiquetas e barras agora vêm da categoria (campo `cor`); os tokens continuam no `cpa.css` mas não são mais usados |
| `--cpa-bar-negado/analise/concluido` | `#c40000` / `#ffe600` / `#00c800` | barras do gráfico |
| `--cpa-mono` | Share Tech Mono + fallbacks | fonte |

**Modelo de tela:** `.cpa-root` (fixo, cobre a janela, sem rolagem da página) → `.cpa-stage` (100% × 100%). Tudo é medido em unidades `u` (px do mockup 960 × 540) e as barras acompanham a largura da janela. Fundo: login em gradiente (ciano → azul → roxo → vermelho), painel `#d8dde2`, demais `#f2f2f2`.

**Helpers** (`src/lib/cpa-box.ts`):

| Função | Efeito |
|---|---|
| `u(n)` | `calc(n * var(--u))` |
| `box(x, y, w, h, extra?)` | posição absoluta: canto superior esquerdo + largura e altura |
| `size(w, h, extra?)` | só largura/altura (itens flex, `flex: none`) |
| `band({left,right,top,bottom,h}, extra?)` | faixa que acompanha a largura da janela |

**Regras de projeto:**
- A **geometria** (posição e tamanho) vai em `style` inline via helpers; a **aparência** (cores, bordas, hover) vai em classes `cpa-*` no `cpa.css`. O inline vence qualquer classe do shadcn/Tailwind, o que evita quebrar o layout.
- Classes de aparência são escopadas (`.cpa-stage .cpa-btn`, `.cpa-modal .cpa-tag`) e usam `!important` só no dimensionamento do modal, para vencer o `DialogContent` do shadcn.
- Centralização com `.cpa-center` (`left/top: 50%` + `translate: -50% -50%`); o modal usa `inset: 0; margin: auto` e `translate: none`.
- Classes utilitárias: `.cpa-sr` (apenas leitor de tela), `.cpa-bar` (faixa azul), `.cpa-pill` (cápsula azul), `.cpa-btn` com variantes `--line` (contorno claro) e `--ghost` (transparente), `.cpa-card`, `.cpa-label`, `.cpa-field` (inputs), `.cpa-note`.
- Páginas são **server components**; `Dialog` é usado a partir de servidor via `DialogTrigger asChild`.
- Seções do `cpa.css`: tokens e janela · peças comuns · 1 login · 2 painel · 3 central · 4 modal · 5 resultados · 6 responder · `/pesquisa`.

## 7. Componentes compartilhados

| Componente | Props | O que faz |
|---|---|---|
| `BarraInstitucional` | `as` (`div`/`header`/`footer`), `style`, `children` | Faixa azul-marinho de cantos arredondados (12u). Vazia, é decorativa (`aria-hidden`). Com filhos, vira o cabeçalho das telas internas (botão de voltar + título `h1` de 36u) |
| Botão de voltar | — | `Button asChild` + `Link` com `ArrowLeft` em `box(34,17,40,34)`, classes `cpa-btn cpa-btn--ghost`; presente em `/pesquisa`, `/devolutivas`, `/resultados`, `/devolutivas/responder` |
| `RedeDePontos` | — | SVG decorativo do login (46 pontos, linhas entre pontos a menos de 150u) |

Componentes shadcn em uso: `Button`, `Input`, `Label`, `Dialog` (`DialogContent`, `DialogTitle`, `DialogDescription`, `DialogTrigger`), `Badge`. Presentes mas sem uso: `Card`, `ScrollArea`.

## 8. Inventário de telas e elementos de UI

Coordenadas em px do mockup (960 × 540): `box(x, y, w, h)` = esquerda, topo, largura, altura. Entre parênteses, o componente que as define.

### 8.1 `/login` — Login - CPA

Fundo em gradiente + `RedeDePontos`.

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Barra superior | `band(left 14, right 14, top 22, h 68)` | `BarraInstitucional` (header), vazia |
| Cartão central | 588 × 284, centralizado | `section.cpa-card.cpa-center`, `aria-labelledby` do título |
| Título "Login - CPA" | `box(226,12,131,48)` | `h1.cpa-pill`, raio 24u, fonte 16u |
| Rótulo "E-Mail" + campo | rótulo `box(75,84,94,30)`; campo `box(198,84,307,30)` | `Label` + `Input type=email id=email name=email autoComplete=username`, classe `cpa-field` |
| Rótulo "Senha" + campo | rótulo `box(75,151,94,30)`; campo `box(198,151,307,30)` | `Input type=password id=senha name=senha autoComplete=current-password` |
| Botão "Entrar" | `box(226,218,131,49)` | `Button asChild` + `Link href=/inicio`, `cpa-btn--line`, raio 25u |
| Barra inferior | `band(left 14, right 14, bottom 21, h 68)` | `BarraInstitucional` (footer), vazia |

Estado atual: não é `<form>`; "Entrar" é um link. Os campos não têm validação.

### 8.2 `/inicio` — Painel principal

Fundo `.cpa-home`: foto `public/images/home-bg.jpg` (ainda ausente) com reserva (círculo claro e faixa de tijolo à direita).

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Cabeçalho (`HomeHeader`) | `band(left 43, right 0, top 21, h 60)`, flex | Itens em linha, com espaçamentos: voltar → `i` = 37u, `i` → saudação = 28u, saudação → perfil = 21u |
| Botão voltar | 58 × 52, raio 26u | `Link → /login`, ícone `Undo2` 26u, `aria-label="Voltar"` |
| Botão `i` (informações) | 54 × 44, raio 12u, fonte 22u | `type=button`, `cpa-btn--line`; **sem ação** |
| Saudação | flex 1, altura 60u, raio 30u, fonte 20u | `h1.cpa-pill`: "Seja bem vindo, [Usuário]!" (texto fixo) |
| Perfil | 185 × 60, fonte 17u | `.cpa-profile`: texto fixo "Administrador" + avatar circular com `UserRound`; "Perfil ativo:" só para leitor de tela |
| Bloco central (`StatusPesquisa`) | 782 × 223, centro da tela deslocado 39,5u para baixo | contém banner e 4 botões |
| Banner | `box(0,0,782,93)` | `section role=status` `.cpa-banner`: `h2` "Pesquisa CPA 2026/2 Aberta" (42u, sem quebra) + `.cpa-dot` verde (`role=img`, "Pesquisa em andamento") |
| Botão "Acessar ⇢" | `box(50,148,196,72)`, raio 28u, fonte 25u | `Link → /pesquisa`, `cpa-btn--line`, seta tracejada SVG (44 × 16u) |
| Botão envelope | `box(286,144,122,79)`, raio 28u | `Link → /devolutivas`, SVG de envelope; `aria-label="Mensagens e devolutivas"` |
| Botão Resultados | `box(448,144,122,79)`, raio 28u | **não aparece para aluno** (marcador `data-somente="coordenacao"`), `Link → /resultados`, ícone de gráfico de barras |
| Botão Responder devolutivas | `box(610,144,122,79)`, raio 28u | **não aparece para aluno**, `Link → /devolutivas/responder`, ícone de balão de mensagem |
| Rodapé | `band(left 21, right 21, bottom 22, h 60)` | `BarraInstitucional` (footer), vazio |

Ao implementar: período/estado da pesquisa e nome/perfil vêm da sessão; os dois botões restritos aparecem só para a coordenação (conforme `roles`); o botão **Acessar** deve abrir direto o **Google Forms** da pesquisa ativa (`cpas.form_link`, `target="_blank"`), o que torna `/pesquisa` desnecessária. O texto "Administrador" do cabeçalho é fixo do mockup e deve passar a mostrar o perfil real.

### 8.3 `/pesquisa` — Pesquisa CPA 2026/2 (provisória)

| Elemento | Detalhes |
|---|---|
| Cabeçalho | `BarraInstitucional` `band(10,10,13,h68)` com botão voltar (→ `/inicio`) e `h1` "Pesquisa CPA 2026/2" |
| Aviso | `p.cpa-note.cpa-center` 600 × 40: "O formulário de preenchimento da pesquisa será construído nesta área." |

O formulário da pesquisa **ainda não foi especificado nem desenhado**.

### 8.4 `/devolutivas` — Central de Devolutivas

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Cabeçalho | `band(10,10,13,h68)` | botão voltar (→ `/inicio`) + `h1` "Central de Devolutivas" |
| Painel cinza | `band(left 14, right 14, top 96, bottom 72)` | `.cpa-panel`, raio 12u; filhos são relativos a ele |
| Busca | `box(18,14,210,34)` | `.cpa-search` (raio 17u): ícone `Search` 18u + `Input type=search id=busca-devolutivas placeholder="Pesquisar"`; `Label` só para leitor de tela. **Não filtra** |
| Fileira de anos | `band(left 18, right 18, top 58, h 300)` | `.cpa-years`: rolagem horizontal **real** (barra estilizada em pílula, 26u de altura), `tabIndex=0`, `role=region`, "Devolutivas por ano"; gap 20u. Arrastar a barra ou shift + roda |
| Card de ano | botão `.cpa-year` | `aria-label="Abrir o mural de devolutivas de {ano}"`; contém `CartaoAno`: faixa com o ano (`.cpa-year-head`), título "Número de Sugestões por Tipo de Deferimento" (`.cpa-year-title`) e gráfico |
| Gráfico de status | `GraficoStatus` | 3 barras, uma por **categoria da resposta**: vermelha **Impertinente**, amarela **Inapto**, verde **Resolvido** (antes: Não Procedidas, Em Análise, Procedidas); nome e cor vêm da categoria; número sobre cada barra; altura = contagem × 17u (mínimo 3u quando zero); `role=img` com texto resumo |
| Rodapé | `band(left 14, right 14, bottom 14, h 44)` | `BarraInstitucional` (footer) |

Dados: `RESUMO_ANOS` em `src/lib/devolutivas-data.ts` (contagem por categoria: impertinente / inapto / resolvido) — 2026 (5/3/1), 2025 (2/2/4), 2024 (1/1/6), 2023 e 2022 (extras só para haver rolagem; apagáveis).

### 8.5 Modal "Mural de Devolutivas"

Abre ao clicar em um card de ano (`MuralDialog`, `Dialog` do shadcn, `DialogContent.cpa-modal`). Tamanho **662 × 370u**, centralizado e sempre dentro da área visível. Coordenadas relativas ao modal.

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Título | `box(43,15,577,53)` | `DialogTitle` "Mural de Devolutivas", 18u |
| Descrição | só leitor de tela | `DialogDescription`: "Devolutivas da instituição em {ano}…" |
| Barra de rolagem decorativa | `box(632,56,18,60)` | `.cpa-m-scroll`, `aria-hidden` (não rola de verdade) |
| Devolutiva em destaque | `box(43,92,577,135)` | `.cpa-m-item`; **título** da devolutiva em `box(22,13,544,85)` (com barra decorativa interna `box(518,8,18,60)`); abaixo, à direita: botão **Ver resposta** + etiqueta da categoria |
| Devolutivas recolhidas (2) | `box(43,234,577,61)` e `box(43,299,577,60)` | título curto `box(14,5,250,35)` (`.cpa-m-text--short`); botão **Ver resposta** + etiqueta à direita (top 19u) |
| Etiquetas (`EtiquetaCategoria`) | altura 22u, fonte 16u | `Badge` com texto preto; texto e **cor vêm da categoria**: **Impertinente** (vermelha `#f20000`), **Inapto** (amarela `#ffeb00`), **Resolvido** (verde `#00e000`) |

Dados: `MANIFESTACOES_EXEMPLO` (3 itens fixos, iguais em todos os anos): "Queria que devolvessem todo meu dinheiro!!!!!!!!" (não procede), "Mais uma Máquina de Snacks..." (em análise), "Ter uma área vazia focada para o..." (concluído). Não há expandir/recolher nem rolagem real.

O botão de fechar (X) do `DialogContent` e o fechamento por Esc/clique fora vêm do Radix.

**Botão "Ver resposta" e janela de justificativa (registros 0016 e 0017):** **todo item do Mural tem resposta** (só devolutivas respondidas aparecem). O botão **Ver resposta** (cápsula azul-marinho com contorno claro, 22u de altura) fica à esquerda da etiqueta da categoria, dentro de `div.cpa-m-actions`. O clique abre uma segunda janela, `RespostaDialog` (`resposta-dialog.tsx`), de **560 × 330u** (`cpa-modal cpa-modal--resposta`), com: título "Resposta da Devolutiva"; bloco azul-marinho com **Título**, **Área responsável** + **etiqueta da categoria** e **Justificativa** (caixa cinza com rolagem real). CSS em `src/app/cpa-resposta.css` (arquivo separado; não altera o `cpa.css`).

**Centralização (ajuste do usuário, registro 0015):** no projeto real o modal usa `<DialogContent className="cpa-modal translate-x-0 translate-y-0">`. As classes `translate-x-0 translate-y-0` anulam o deslocamento de centralização do shadcn (Tailwind v4); o `cpa.css` centraliza com `inset: 0; margin: auto`. Manter essas classes ao enviar novos arquivos. O X do shadcn aparece como círculo branco no canto superior esquerdo do modal (não está no mockup).

### 8.6 `/resultados` — Resultados da Pesquisa CPA (restrita: aluno não acessa)

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Cabeçalho | `band(10,10,13,h68)` | botão voltar (→ `/inicio`) + `h1` "Resultados da Pesquisa CPA" |
| Lista de CPAs | `.cpa-results` `band(left 32, right 22, top 100, bottom 16)` | rola na vertical (barra estilizada); uma `CartaoCpa` por semestre |
| Dropdown de CPA (`CartaoCpa`) | `<details class="cpa-cpa">` | `<summary>` azul-marinho de 72u, "CPA - {período}" centralizado (30u) com seta SVG à direita (baixo = fechado, cima = aberto); a mais recente (2026/2) abre expandida |
| Corpo aberto | grade `378fr 341fr 72u`, altura 294u, fundo cinza | três colunas: gráfico · lista de perguntas · ferramentas |
| Gráfico / respostas | `.cpa-res-chart` 234u de altura | pergunta de **alternativas**: `GraficoPizza`; pergunta **discursiva**: `ul.cpa-lines` (uma linha por resposta, separadas por traço, com rolagem) |
| Lista de perguntas | `.cpa-res-list` com rolagem | `label.cpa-q` ("Pergunta 1…6") de 44u; a selecionada fica cinza-escura com borda grossa |
| Ferramentas | `.cpa-res-tools` | 2 botões fantasma (30u): **Baixar resultados** (`Download`) e **Ver relatório** (`FileText`); **sem ação** |

Troca de pergunta e abrir/fechar funcionam **sem JavaScript**: `<details>` + rádios ocultos (`name=perguntas-{cpa.id}`, id `{cpa.id}-q{q.id}`) + CSS `:has(input[value="N"]:checked)` (suporta até 8 perguntas). Requer Chrome/Edge 105+, Safari 15.4+, Firefox 121+. Ao ligar dados reais, esse mecanismo pode ser mantido ou trocado por estado React.

**`GraficoPizza`** (`valores: number[]`, `titulo: string`): SVG `viewBox 0 0 378 234`, centro (193,121), raio 74; fatias A–E com cores `#00a9dc`, `#ffa400`, `#3b8de0`, `#86c00a`, `#6f7f7f`; porcentagem dentro da fatia (some se < 4%); letra numa elipse fora, ligada por seta; `role=img` com `aria-label` resumindo ("Pergunta 1, CPA 2026/2. A: 40%; …"). As porcentagens devem somar 100.

Dados (`src/lib/resultados-data.ts`): tipos `CpaResultado {id, periodo}`, `Questao` = `QuestaoAlternativa {tipo:"alternativa", valores}` | `QuestaoDiscursiva {tipo:"discursiva", respostas}`; `CPAS` = 2026/2, 2026/1, 2025/2, 2025/1 (ids `"2026-2"`…); `QUESTOES` = 6 perguntas (1, 2, 4, 6 alternativas; 3 e 5 discursivas), iguais em todas as CPAs.

### 8.7 `/devolutivas/responder` — Responder Devolutiva (restrita: aluno não acessa)

| Elemento | Posição/tamanho | Detalhes |
|---|---|---|
| Cabeçalho | `band(10,10,13,h68)` | botão voltar (→ `/inicio`) + `h1` "Responder Devolutiva" |
| Cartão cinza | 640 × **400** (era 360), centralizado e 32u abaixo do meio | `section.cpa-card.cpa-center`, `aria-label="Resposta da devolutiva"` |
| **Título da resposta** (registro 0016) | rótulo `box(24,18,592,22)`; campo `box(24,42,592,34)` | `Input id=titulo name=titulo placeholder="Escreva o título"`, classe `cpa-field` |
| Área responsável | rótulo `box(24,92,290,22)`; select `box(24,116,290,34)` | `<select id=area name=area>`, opção inicial "Selecione a área"; opções **reais** (registro 0015): Coordenação, Infraestrutura, Reitoria, Secretaria, Secretaria de Coordenação, TI (a lista de exemplo anterior foi descartada; a fonte futura é a tabela `areas`) |
| Categoria da resposta | rótulo `box(326,92,290,22)`; select `box(326,116,290,34)` | `<select id=categoria name=categoria>`; opções de `CATEGORIAS_RESPOSTA` (Resolvido, Inapto, Impertinente; valores `resolvido`, `inapto`, `impertinente`); **Resolvido já vem selecionado** (como no projeto do usuário) |
| Motivo da resposta | rótulo `box(24,166,592,22)`; textarea `box(24,190,592,130)` | `<textarea id=motivo name=motivo placeholder="Descreva o motivo da resposta">`, sem redimensionar |
| Botão "Enviar resposta" | `box(220,338,200,44)` | `Button type=button`, `cpa-btn--line`; **sem ação** |

Os selects e o textarea são elementos **nativos** estilizados no CSS (seta em data-URI). Podem ser trocados por `shadcn add select textarea`. A tela **cria uma devolutiva**: não há manifestação a identificar, porque a instituição responde a um assunto muito citado (registro 0017). A resposta aparece depois no Mural, com a categoria escolhida.

## 9. Modelo de dados atual (somente exemplos)

```ts
// src/lib/devolutivas-data.ts  (modelo do registro 0017)
type CategoriaResposta = { id: string; rotulo: string; cor: string };  // vem do banco; cor por categoria
CATEGORIAS_RESPOSTA   // ordem do dropdown: resolvido #00e000, inapto #ffeb00, impertinente #f20000
ORDEM_BARRAS          // ordem das barras: impertinente, inapto, resolvido
categoriaPorId(id)
type AnoDevolutivas = { ano: number; contagem: Record<string, number> };  // por id de categoria
RESUMO_ANOS           // 5 anos de exemplo (as barras da Central)
type Devolutiva = { id: string; titulo: string; area: string; categoria: string; justificativa: string };
DEVOLUTIVAS_EXEMPLO   // 3 devolutivas do Mural (todas com resposta)

// src/lib/resultados-data.ts
type CpaResultado = { id: string; periodo: string };
type Questao = QuestaoAlternativa | QuestaoDiscursiva;
```

**Vocabulário (decisões do usuário, registros 0016 e 0017):** as categorias da resposta são **Inapto, Impertinente e Resolvido**; as etiquetas vêm do banco, cada uma com sua cor. As **barras da Central e as etiquetas do Mural usam as mesmas categorias**: Não Procedidas → Impertinente, Em Análise → Inapto, Procedidas → Resolvido (o usuário reconhece que "Em Análise → Inapto" não traduz bem). Não existe etiqueta para "sem resposta", porque só devolutivas respondidas aparecem. Os status antigos (`StatusDevolutiva`, "Pedido em Análise") foram removidos.

## 10. Pendências e pontos de implementação

Os pontos estão marcados com `TODO (implementação)` no código.

**Funcionalidades a implementar (sugestão de ordem):**
1. **Autenticação e sessão** por perfil (aluno, coordenador, administrador, avaliador externo): `<form>` no login, botão "Entrar" como `submit`, logout (hoje o voltar do painel leva a `/login`). O banco já tem `profiles` (liga a `auth.users`) e `roles`: o caminho previsto é o **Supabase Auth** + perfil lido de `profiles.role`.
2. **Proteção de rotas** em `src/middleware.ts` (hoje pass-through): `/resultados` e `/devolutivas/responder` bloqueadas para o perfil aluno (a coordenação acessa tudo); decidir o que cada perfil vê (coordenador/avaliador externo/aluno) em `/inicio`, `/devolutivas`, `/resultados`.
3. **Painel (`/inicio`)**: nome e perfil reais no cabeçalho; período/estado da pesquisa vindos do back-end; botões de administrador condicionais; ligar o botão `i`.
4. **Pesquisa**: o botão Acessar abre o Google Forms (`cpas.form_link`); depois, criar o mecanismo que **lê as respostas do Forms** (a instituição tem a conta criadora do formulário) para alimentar `/resultados`.
5. **Central de Devolutivas**: filtrar cards pela busca; contagem por ano e categoria (agregação de `respostas`).
6. **Mural**: carregar as devolutivas do ano (só as com resposta), expandir/recolher cada uma, rolagem real da lista (hoje a barra é decorativa).
7. **Responder devolutiva**: `<form>`, validação e gravação (título, área, categoria, motivo); a devolutiva aparece no Mural.
8. **Resultados**: dados reais por CPA, agregação de respostas, "Baixar resultados" e "Ver relatório".

**Outros itens:**
- Colocar a foto de fundo em `public/images/home-bg.jpg` (sem ela aparece a reserva).
- Confirmar a fonte original dos mockups (Share Tech Mono é aproximação).
- Remover arquivos sem uso, se o usuário concordar: `src/lib/auth-mock.ts`, `session.ts`, `perfis.ts`, `src/app/login/actions.ts`, `src/components/cpa-page.tsx`, `cpa-fonte.ts`, `src/styles/cpa.css`. Os de perfil/sessão podem servir de ponto de partida para a autenticação (perfis e rótulos já definidos).
- Decidir se a Central mostra só 2026/2025/2024 (apagar 2023 e 2022 de `devolutivas-data.ts`).
- Acessibilidade e responsividade: as telas são feitas para janela de proporção 16:9 (escala por `--u`); celular em modo retrato não foi tratado.

## 11. Armadilhas conhecidas (não repetir)

- **Não usar utilitários Tailwind para layout das telas**: o visual quebrou no projeto real (fonte serifada, botões `#171717`, marcadores de lista) quando dependia do Tailwind/`globals.css`. O CSS próprio resolveu.
- **Tailwind v4 usa a propriedade `translate`**: não centralizar com `transform: translate(...)` junto; usar `translate` ou `inset: 0; margin: auto` (como o modal).
- **Estilos dos componentes shadcn** (Button, Input, DialogContent) concorrem com as classes `cpa-*`; por isso a especificidade `.cpa-stage .x` e o `!important` no modal.
- **Prisma 7 + Supabase** (registro 0015): não apagar os models do schema `auth`; não usar `prisma migrate dev` nem `prisma db push` (alterar tabelas no Supabase e rodar `db pull` + `generate`); senha do banco só com letras e números (um `#` quebrou a URL, P1013); `PrismaClient` apenas no servidor; nunca colar senha ou URL completa em conversas e documentos.
- Não enviar ao usuário `package.json`, `prisma/`, `.env*` nem `src/lib/prisma.ts`: eles existem só no projeto dele.
- **Antes de criar arquivos, listar o que já existe** (`find src -type f`) para não sobrescrever implementação anterior (ocorreu no registro 0013).
- Arquivos enviados pelo assistente **substituem** os de mesmo caminho no projeto do usuário.
- Zips entregues: `portal-cpa.zip` (0001–0007), `portal-cpa-visual.zip` (0009), `-v2` (0010), `-v3` (0011), `-v4` (0012 e 0013; é a versão mais recente das páginas de administrador).

## 12. Banco de dados e Prisma (resumo do registro 0015)

**Tabelas (Supabase, schema `public`):** `cpas` (id, form_link, ano, semestre, title, is_active) · `profiles` (user_id → `auth.users.id`, email, nome, role → `roles.id`) · `roles` (id, role) · `areas` (nome_area, chave) · `respostas` (area → `areas.nome_area`, status, ano, resposta). Detalhes e dúvidas: `0015-supabase-prisma-e-ajustes-do-usuario.md`.

**Conexão:** `DATABASE_URL` (Transaction Pooler, porta 6543, `?pgbouncer=true`) para a aplicação; `DIRECT_URL` (Session Pooler/direto, porta 5432) para a CLI do Prisma. `schema.prisma` com `schemas = ["public", "auth"]` e gerador `prisma-client` com saída em `src/generated/prisma`. O `PrismaClient` usa `PrismaPg` como adaptador (`src/lib/prisma.ts`).

**Decisões do usuário (registros 0016 e 0017):** **não existem manifestações formais**: quando a instituição percebe que muitas reclamações (ou cobranças) são sobre o mesmo assunto, ela mesma cria uma **devolutiva** (resposta) com título, área, categoria e justificativa. Os formulários são feitos no **Google Forms**; o botão Acessar abre o formulário e, no futuro, o portal lê as respostas (a instituição tem a conta criadora). A chave de `respostas` será uma **surrogate key**. A **cor das etiquetas fica no banco**. Contas vêm de um banco interno; `roles` definem permissões (inicialmente só Aluno e Coordenação).

**Proposta de ajuste do banco** (não executada; detalhes no 0017): tabela de categorias com `nome` e `cor`; `respostas` com `id` próprio, `titulo`, `categoria_id`, `area`, `ano`, justificativa; contagem por ano e categoria obtida por agrupamento.

**Ainda em aberto:** como serão importadas as respostas do Google Forms para o portal (API do Forms ou planilha vinculada).

**Fluxo para mudar o banco:** criar/alterar tabelas no painel ou SQL Editor do Supabase → `npx prisma db pull` → `npx prisma generate`.

## 13. Texto pronto para abrir uma nova conversa

> Estou desenvolvendo o **Portal CPA** (Faculdade Impacta) em Next.js (App Router) + TypeScript + shadcn/ui. Já existe um **protótipo somente visual** de todas as telas (login, painel, pesquisa provisória, central de devolutivas com modal Mural, resultados da pesquisa e responder devolutiva — as duas últimas só para administrador), e o projeto já está conectado ao **Supabase via Prisma 7** (seção 12 do arquivo). O arquivo anexo (`0014-contexto-do-projeto.md`) descreve rotas, componentes, coordenadas, CSS (`src/app/cpa.css` + helpers `box/size/band/u`), dados de exemplo e pendências. Quero começar a **implementar a funcionalidade X** (ex.: autenticação por perfil). Regras: não refazer o visual; manter o CSS próprio; antes de criar arquivos, verificar os existentes; **toda alteração deve gerar um registro numerado e datado em `docs/registros/` (próximo número: 0018) e uma linha no `INDEX.md`**.
