# Registro nº 0022 — Limpeza de código e arquivos sem uso (Portal CPA)

| Campo | Valor |
|---|---|
| **Número** | 0022 |
| **Data da alteração** | 18/11/2026 (America/Sao_Paulo) |
| **Tipo** | Manutenção pré-deploy: remoção de arquivos, linhas, regras CSS e dependências comprovadamente sem uso |
| **Complementa** | `0021 - Arquitetura e Plano de Implementação Lógica` e `0021 - Guia Visual e Arquitetura de Componentes` |
| **Próximo registro livre** | **0023** |

## Método de comprovação
1. `tsc --noUnusedLocals` sobre todo `src/` (exceto `src/generated`): zero imports/variáveis não usados ao final.
2. Varredura de importadores de cada arquivo `.ts/.tsx` e de cada `export` (nome buscado em todos os demais arquivos).
3. Varredura de cada classe CSS de `cpa.css`, `cpa-resposta.css` e `globals.css` contra todo o código (incluindo classes montadas por template string — nenhuma usa prefixo dinâmico das classes removidas).
4. Teste no Chromium confirmando que o `:root` sem camada de `globals.css` sobrescreve o `:root` dentro de `@layer base`.
5. Comparação de erros do compilador original × novo: somente reduções, nenhum código de erro novo (os erros restantes vêm de `node_modules` ausente no ambiente de análise).

## 1. Arquivos removidos (4)
| Arquivo | Motivo |
|---|---|
| `src/app/login/actions.ts` | Duplicata de `src/app/actions/auth.ts`. Nenhum arquivo importa `@/app/login/actions`; `LoginForm` usa `@/app/actions/auth`. |
| `src/components/rede-de-pontos.tsx` | Componente `RedeDePontos` nunca importado (login usa `wallpaper.png`). |
| `src/components/ui/card.tsx` | Nenhum `Card*` importado em todo o projeto. |
| `src/components/ui/scroll-area.tsx` | Nenhum `ScrollArea`/`ScrollBar` importado em todo o projeto. |

## 2. Linhas removidas em código
| Arquivo | O que saiu | Motivo |
|---|---|---|
| `src/app/layout.tsx` | 2ª ocorrência de `import "./globals.css"` e `import "./cpa.css"` | Importação duplicada no mesmo arquivo. |
| `src/app/pesquisa/page.tsx` | Imports `Link`, `ArrowLeft`, `BarraInstitucional`, `Button`, `band/box/size/u` | Página só executa `redirect("/inicio")`; nada era usado (a rota continua existindo). |
| `src/app/actions/cpas.ts` | `semestre` (leitura do formulário, validação "semestre deve ser 1 ou 2" e gravação no `create`) | Resquício do ciclo semestral. O formulário `PainelCpas` não envia `semestre` e a tabela `cpas` não tem a coluna. **Efeito prático:** antes, `criarCpaAction` sempre falhava na validação; agora cria a CPA normalmente. |
| `src/lib/dashboards-data.ts` | Campos `slug`, `perfis`, `ordem`, `ativo` de `DashboardCpa` e o import de `PerfilCpa` | Nenhum era lido (só `id`, `titulo`, `embed_url`, `embed_url_externo` são usados). |
| `src/app/resultados/page.tsx` | Atribuições `ordem`, `ativo`, `perfis` no `map` e o import `type PerfilCpa` | Consequência da linha acima. A ordenação/filtro continuam na query Prisma. |
| `src/components/ui/dialog.tsx` | `DialogClose`, `DialogHeader`, `DialogFooter` (definições) e `DialogOverlay`, `DialogPortal` do bloco de `export` | Não importados em lugar nenhum (`DialogOverlay`/`DialogPortal` seguem usados internamente por `DialogContent`). |

## 3. CSS removido
**`src/app/cpa.css`** — classes sem nenhuma referência em TSX: `.cpa-net`, `.cpa-year-title`, `.cpa-bar-negado`, `.cpa-bar-analise`, `.cpa-bar-concluido`, `.cpa-m-scroll`, `.cpa-m-item--featured`, `.cpa-m-item--compact`, `.cpa-m-text--full`, `.cpa-tag--negado`, `.cpa-tag--analise`, `.cpa-tag--concluido` (a cor da etiqueta vem do `hex` do banco), `.cpa-note` (+ comentário "/pesquisa página provisória"), e o bloco `.cpa-root--login::before / ::after / .cpa-bg` (nenhuma regra gera esses pseudo-elementos nem existe elemento `.cpa-bg`).
Variáveis que ficaram órfãs: `--cpa-tag-analise`, `--cpa-tag-concluido`, `--cpa-bar-analise`, `--cpa-bar-concluido`. (`--cpa-tag-negado` e `--cpa-bar-negado` continuam em uso por `.cpa-dot--closed` e `.cpa-logout:hover`.)

**`src/app/globals.css`**
- `@layer utilities { .bg-login … .bg-home … }`: classes nunca usadas (e `.bg-home` apontava para `/images/home-bg.jpg`, inexistente).
- Dentro de `@layer base :root`: todo o conjunto legado em HSL (`--background … --radius`) — **sobrescrito integralmente** pelo `:root` sem camada logo abaixo (verificado no Chromium) — mais `--status-*`, `--bar-*` e `--ponto-aberta`, que nenhum arquivo referencia. Mantido apenas `--destructive-foreground` por ser nome padrão do shadcn (não dá para provar offline que `shadcn/tailwind.css` não o lê).

## 4. Dependências removidas de `package.json` (e do bloco raiz do `package-lock.json`)
- `pg` e `@types/pg`: nenhum `import` direto no projeto; ambos já são dependências de `@prisma/adapter-pg` e continuam instalados por ele. Nenhuma mudança na árvore instalada.

## 5. Verificados e mantidos (não removidos)
- `src/generated/prisma/**` (cliente gerado; inclui models de `auth` exigidos pela FK de `profiles`).
- `prisma7.config.ts`: **atenção** — a CLI do Prisma só descobre automaticamente `prisma.config.ts`; este nome não é carregado sozinho (a documentação 0021 cita `prisma.config.ts`). Não é código morto, mas o nome merece conferência.
- `skills-lock.json`, `components.json`, `.env`, `.gitignore` (`/docs` está ignorado pelo git — os registros não sobem ao repositório).
- `url("/images/home-bg.jpg")` em `.cpa-home` (cpa.css): arquivo não existe em `public/` (gera 404 a cada abertura de `/inicio`), mas é um gancho opcional para uma imagem futura; remover é decisão sua.
- Bloco "placeholder" com KPIs fictícios em `cartao-cpa.tsx` (exibido se `embed_url` vier vazio) e valores padrão de props em `StatusPesquisa`/`HomeHeader`: alcançáveis/ não provados inúteis.
- `import "@/app/cpa.css"` repetido nas páginas (já importado no `layout.tsx`): provável redundância, mas não verificável sem rodar o build do Next.
