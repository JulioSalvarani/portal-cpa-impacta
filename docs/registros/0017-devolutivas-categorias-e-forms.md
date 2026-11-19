# Registro nº 0017 — Devolutivas, categorias únicas, Google Forms e perfis

| Campo | Valor |
|---|---|
| **Número** | 0017 |
| **Data da alteração** | 16/11/2026, 00:30 (America/Sao_Paulo) |
| **Tipo** | Atualização (código, registros 0014, 0015 e 0016) |
| **Origem** | Respostas do usuário às perguntas do registro 0016 |
| **Relacionados** | 0014, 0015, 0016 |

## 1. Respostas do usuário

| # | Resposta |
|---|---|
| 1 | **Não existem manifestações formais.** Quando a faculdade percebe que muitas reclamações (ou cobranças) são sobre o mesmo assunto, ela mesma cria uma resposta (devolutiva) |
| 2 | Inicialmente **só Aluno e Coordenação** serão usados |
| 3 | O botão **Acessar abre o formulário** (Google Forms). Mais adiante será preciso um mecanismo para **pegar os resultados do Forms** (a instituição tem a conta criadora) |
| 4 | **Sem resposta, não há etiqueta**: toda devolutiva só vem à tona se tem resposta. As categorias das **barras** e das **etiquetas** passam a ser as mesmas da **categoria da resposta**: Não Procedidas → **Impertinente**, Em Análise → **Inapto**, Procedidas → **Resolvido** (o usuário nota que a tradução de "Em Análise" não faz muito sentido) |
| 5 | A cor de cada categoria pode ficar **no banco** |

## 2. O que mudou no código

- **Mural:** cada item agora é uma **devolutiva** (título, área, categoria, justificativa), não uma manifestação. O texto do item é o **título**; todo item tem o botão **Ver resposta** e a **etiqueta da categoria** (texto e cor da categoria). O status "Pedido em Análise" deixou de existir.
- **Central:** as barras são **Impertinente** (vermelha), **Inapto** (amarela) e **Resolvido** (verde), com nome e cor vindos da categoria. Cada categoria tem **uma única cor**, usada na etiqueta e na barra (as barras ficam um pouco mais vivas que no mockup, que usava tons ligeiramente diferentes).
- **Modelo de dados de exemplo** (`devolutivas-data.ts`): saem `StatusDevolutiva`, `ROTULO_BARRA`, `ROTULO_ETIQUETA`, `Manifestacao`, `MANIFESTACOES_EXEMPLO` e `DEVOLUTIVAS`; entram `Devolutiva`, `DEVOLUTIVAS_EXEMPLO`, `RESUMO_ANOS`, `ORDEM_BARRAS` e `categoriaPorId`. As categorias (`CATEGORIAS_RESPOSTA`) passam a ser **Resolvido** `#00e000`, **Inapto** `#ffeb00` e **Impertinente** `#f20000` (a cor "laranja" provisória do 0016 foi descartada).
- **Responder devolutiva:** a tela **cria** a devolutiva (título, área, categoria, motivo); não há manifestação a identificar.
- **Perfis:** o marcador dos botões restritos do painel passou de `data-somente="administrador"` para `data-somente="coordenacao"`; comentários dizem que só a Coordenação vê Resultados e Responder, e que o Aluno não.
- **Pesquisa:** a página provisória `/pesquisa` agora explica que o botão Acessar abrirá o Google Forms; `status-pesquisa.tsx` ganhou o `TODO` de trocar o `Link` por `<a href={form_link} target="_blank" rel="noopener noreferrer">`. O botão continua levando a `/pesquisa` no protótipo.

### Arquivos

| Arquivo | Alteração |
|---|---|
| `src/lib/devolutivas-data.ts` | Reescrito (modelo de devolutivas e categorias) |
| `src/components/devolutivas/mural-dialog.tsx` | Itens = devolutivas, com botão e etiqueta da categoria |
| `src/components/devolutivas/resposta-dialog.tsx` | Recebe uma `devolutiva` |
| `src/components/devolutivas/grafico-status.tsx` | Barras por categoria, com cor da categoria |
| `src/components/devolutivas/painel-devolutivas.tsx` | Usa `RESUMO_ANOS` |
| `src/components/devolutivas/etiqueta-status.tsx` | **Removido** (substituído por `etiqueta-categoria.tsx`, do 0016) |
| `src/components/status-pesquisa.tsx`, `src/app/pesquisa/page.tsx`, `src/app/resultados/page.tsx`, `src/app/devolutivas/responder/page.tsx` | Comentários e texto do aviso |
| `docs/registros/0014-…` | Atualizado (perfis, Mural, barras, modelo de dados, decisões) |
| `docs/registros/0015-…`, `0016-…`, `INDEX.md`, `README.md` | Notas e índice |

**Resíduo:** o `cpa.css` do usuário continua com as classes e variáveis antigas de cor (`--cpa-tag-*`, `--cpa-bar-*`, `.cpa-bar-negado/analise/concluido`, `.cpa-tag--negado/analise/concluido`). Ficam **sem uso**; podem ser apagadas quando quiser (o assistente não alterou o `cpa.css`).

**Para apagar no projeto do usuário:** `src/components/devolutivas/etiqueta-status.tsx` (o zip não apaga arquivos).

## 3. Perfis e acesso (decisão atual)

| Perfil | `/inicio`, `/devolutivas` | Botões Resultados e Responder, `/resultados`, `/devolutivas/responder` |
|---|---|---|
| Aluno | acessa | **não vê e não acessa** |
| Coordenação | acessa | acessa |

Administrador e avaliador externo ficam para depois. As contas vêm do banco interno da instituição; `roles` define as permissões.

## 4. Google Forms

- A pesquisa é um **formulário no Google Forms**, criado pela instituição (conta criadora). O botão **Acessar** abre o formulário (link em `cpas.form_link`).
- O portal **mostra os resultados** de forma visual (a tela `/resultados`: pizza para alternativas e linhas para discursivas), "abstraindo" o formulário.
- **A construir depois:** um mecanismo que **lê as respostas do Forms**. Caminhos possíveis (a decidir): API do Google Forms com a conta criadora, ou a planilha vinculada ao formulário. Isso exige credenciais da instituição e roda no servidor, nunca no navegador.

## 5. Proposta de ajuste do banco (não executada)

Sugestão, para o usuário avaliar e fazer no Supabase; depois `npx prisma db pull` e `npx prisma generate` (ver 0015). **Não** usar `migrate dev` nem `db push`.

| Tabela | Colunas sugeridas | Observação |
|---|---|---|
| `categorias_resposta` (nova) | `id` (surrogate), `nome` (único: Resolvido, Inapto, Impertinente), `cor` (texto `#rrggbb`) | a cor de cada etiqueta e barra |
| `respostas` (ajustar) | `id` (surrogate, chave primária), `titulo`, `justificativa` (hoje `resposta`), `categoria_id` → `categorias_resposta.id` (hoje `status`), `area` → `areas.nome_area`, `ano` | substitui a chave composta; `titulo` é o campo novo da tela |
| `roles` | valores iniciais: aluno e coordenação | já existe |

- O número de devolutivas por ano e categoria (barras da Central) sai de um **agrupamento** de `respostas` por `ano` e `categoria_id`.
- Cuidado: `areas` usa o **texto** do nome como chave; uma chave numérica evitaria problemas se uma área for renomeada (decisão do usuário).

## 6. Perguntas em aberto

1. **Texto do item do Mural:** assumi que cada item do Mural mostra o **título** da devolutiva e que o botão "Ver resposta" mostra a justificativa. Está correto, ou o item deve mostrar também uma descrição do assunto (por exemplo, um resumo das reclamações)?
2. **Ordem do Mural:** as devolutivas aparecem da mais recente para a mais antiga, por ano? E o card de cada ano da Central lista só as devolutivas daquele ano?
3. **Origem dos resultados do Forms:** API do Google Forms ou planilha vinculada? (Pode ser decidido na hora de implementar.)
4. **Quando entrarem administrador e avaliador externo:** o administrador cria devolutivas como a coordenação? O avaliador externo só vê o Mural e os resultados?

## 7. Verificação

Componentes reais renderizados em navegador (com shadcn, `Link` e ícones simplificados): Central com as novas barras, Mural com os três itens (botão e etiqueta), janela de resposta e `/devolutivas/responder`. O projeto Next em si não foi executado aqui.
