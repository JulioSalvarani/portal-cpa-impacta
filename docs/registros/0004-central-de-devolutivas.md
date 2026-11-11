# Registro nº 0004 — Central de Devolutivas (Dashboard)

| Campo | Valor |
|---|---|
| **Número** | 0004 |
| **Data da alteração** | 09/11/2026, 20:46 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Rota** | `/devolutivas` |

## O que foi feito

- Cabeçalho "Central de Devolutivas" com botão de retorno para `/inicio`.
- **Barra de pesquisa/filtro** no canto superior esquerdo (sem distinção de acentos e maiúsculas). Filtra por **ano** ou por **palavra** presente nas manifestações; os cards sem correspondência somem, e há mensagem quando nada é encontrado.
- **Cards por ano (2026, 2025 e 2024)** com o indicador "Número de Sugestões por Tipo de Deferimento" e botão "Ver mural".
- **Gráficos de barras** por card: Não Procedidas (vermelha), Em Análise (amarela) e Procedidas (verde). Todas as barras usam a mesma escala (maior valor entre os anos) para que os anos sejam comparáveis. Cada barra mostra o número acima e o nome abaixo, então a informação não depende só da cor; o gráfico tem descrição para leitores de tela.
- Linha de cards com **barra de rolagem horizontal** sempre visível, como no mockup.
- Contagens **derivadas** da lista de manifestações (`src/lib/devolutivas-data.ts`), evitando divergência entre gráfico e mural. Os dados são de exemplo.

## Arquivos

`src/app/devolutivas/page.tsx`, `src/components/devolutivas/painel-devolutivas.tsx`, `cartao-ano.tsx`, `grafico-status.tsx`, `src/lib/devolutivas-data.ts`.

## Fora do escopo desta entrega

O mockup "Resultados da Pesquisa CPA" (pizza com alternativas A–E, lista de perguntas, ícones de download e documento) apareceu nas imagens, mas não consta na lista de requisitos e **não foi construído**.
