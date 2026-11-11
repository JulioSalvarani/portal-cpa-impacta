# Registro nº 0005 — Modal "Mural de Devolutivas"

| Campo | Valor |
|---|---|
| **Número** | 0005 |
| **Data da alteração** | 09/11/2026, 20:46 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Componente** | `src/components/devolutivas/mural-dialog.tsx` |

## O que foi feito

- Modal (shadcn `Dialog`) aberto pelo botão "Ver mural" de cada card; título "Mural de Devolutivas" em pílula azul-marinho, com o ano e a quantidade de manifestações logo abaixo.
- **Lista de manifestações** com rolagem vertical: caixa de texto sobre fundo azul-marinho, como no mockup.
  - Cada item pode ser **expandido/recolhido** por clique ou teclado (`aria-expanded`). Recolhido, o texto é truncado e a etiqueta fica à direita; expandido, mostra o texto completo e a etiqueta abaixo. O primeiro item abre expandido.
- **Etiquetas de status** (`etiqueta-status.tsx`):
  - **Não Procede** (vermelha, texto branco);
  - **Pedido em Análise** (amarela, texto escuro);
  - **Concluído** (verde, texto escuro).
- Se houver busca ativa por palavra na Central, o mural mostra só as manifestações correspondentes.
- Fechamento por botão "Fechar", tecla Esc ou clique fora.

## Observação

O requisito escreve a etiqueta como "Concluido"; foi usada a grafia correta **"Concluído"**. Para voltar à grafia original, alterar `ROTULO_ETIQUETA` em `src/lib/devolutivas-data.ts`.
