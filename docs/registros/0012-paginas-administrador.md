# Registro nº 0012 — Páginas de administrador: Resultados e Responder Devolutiva

| Campo | Valor |
|---|---|
| **Número** | 0012 |
| **Data da alteração** | 11/11/2026, 18:30 (America/Sao_Paulo) |
| **Tipo** | Criação (e atualização de `cpa.css`, `status-pesquisa.tsx`, README e índice) |
| **Base visual** | Mockup "Resultados da Pesquisa CPA" enviado pelo usuário |

## Pedido

Duas páginas disponíveis apenas para administradores, somente visuais:

1. **Resultados da pesquisa**: um dropdown para cada CPA (semestral); cada pergunta com gráfico para respostas alternativas e linhas para respostas discursivas.
2. **Responder devolutiva**: página simples, como a da pesquisa, com dropdown de área responsável, dropdown de categoria (resolvido, inapto, impertinente) e área de texto para o motivo.

## 1. `/resultados`

- Cabeçalho "Resultados da Pesquisa CPA" com botão de voltar (para `/inicio`).
- Uma faixa por CPA ("CPA - 2026/2", "CPA - 2026/1", "CPA - 2025/2", "CPA - 2025/1"), que abre e fecha como dropdown; a seta aponta para baixo (fechada) ou para cima (aberta). A mais recente abre expandida.
- Aberta, mostra como no mockup: **gráfico à esquerda** (pizza com alternativas A–E, percentuais e setas), **lista de perguntas à direita** com barra de rolagem e, no canto, os ícones de **baixar** e de **relatório**.
- Pergunta de alternativas → gráfico de pizza. Pergunta discursiva → **uma linha por resposta**, com rolagem.
- Abrir/fechar e trocar de pergunta funcionam **sem JavaScript** (`<details>` e rádios + CSS `:has()`), só para dar para ver todos os estados. Não é lógica de negócio.
- Dados de exemplo em `src/lib/resultados-data.ts` (6 perguntas, 4 CPAs; as mesmas perguntas aparecem em todas as CPAs).

## 2. `/devolutivas/responder`

- Cabeçalho "Responder Devolutiva" com botão de voltar.
- Cartão cinza com: **Área responsável** (dropdown), **Categoria da resposta** (Resolvido, Inapto, Impertinente), **Motivo da resposta** (área de texto) e botão **Enviar resposta** (sem ação).
- As áreas são de exemplo (Secretaria Acadêmica, Coordenação de Curso, Infraestrutura e Manutenção, Biblioteca, Financeiro, Tecnologia da Informação, Direção); ajustar a lista real em `form-resposta.tsx`.
- Os dropdowns e a área de texto usam elementos nativos do navegador, estilizados em `cpa.css`, para não exigir novos componentes shadcn (`select` e `textarea`). Dá para trocá-los depois por `shadcn add select textarea`.

## Acesso pelo painel principal

Na tela `/inicio` foram acrescentados dois botões ao lado do envelope: **Resultados** (ícone de gráfico) e **Responder devolutivas** (ícone de mensagem), marcados com `data-somente="administrador"`. Os botões "Acessar" e envelope se deslocaram para a esquerda para caber os quatro, centralizados.

**Nenhuma restrição de acesso foi implementada**: qualquer pessoa chega às duas páginas pela URL. Marcado com `TODO (implementação)` para o perfil "administrador".

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/app/resultados/page.tsx` | **Novo** |
| `src/components/resultados/cartao-cpa.tsx` | **Novo** (dropdown de CPA) |
| `src/components/resultados/grafico-pizza.tsx` | **Novo** (pizza em SVG, calculada a partir dos percentuais) |
| `src/lib/resultados-data.ts` | **Novo** |
| `src/app/devolutivas/responder/page.tsx` | **Novo** |
| `src/components/devolutivas/form-resposta.tsx` | **Novo** |
| `src/app/cpa.css` | Seções 5 (resultados) e 6 (responder); `select` e `textarea` herdam a fonte |
| `src/components/status-pesquisa.tsx` | Dois botões de administrador; Acessar e envelope reposicionados |
| `README.md`, `docs/registros/INDEX.md` | Rotas e índice |

## Verificação

Os componentes reais foram renderizados em navegador, com versões simplificadas do shadcn, do `Link` e dos ícones (não instalados neste ambiente): `/resultados` (abrir o segundo CPA, trocar de pergunta, pergunta discursiva), `/devolutivas/responder` e `/inicio`, sem rolagem da página. **O projeto Next em si não foi executado aqui.** O `:has()` precisa de navegador recente (Chrome/Edge 105+, Safari 15.4+, Firefox 121+).

## Pendências

- Restrição de acesso por perfil.
- A manifestação que está sendo respondida não aparece na tela de resposta (não estava no pedido); pode ser acrescentada acima dos campos.
- Dados reais (CPAs, perguntas, respostas) e ações dos ícones de baixar e relatório.
