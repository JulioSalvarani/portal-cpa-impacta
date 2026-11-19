# Registro nº 0016 — "Ver resposta" no Mural, título da resposta e decisões do usuário

| Campo | Valor |
|---|---|
| **Número** | 0016 |
| **Data da alteração** | 16/11/2026, 00:25 (America/Sao_Paulo) |
| **Tipo** | Criação (componentes novos) e atualização (arquivos existentes, registros 0014 e 0015) |
| **Origem** | Respostas do usuário às perguntas do registro 0015 (mensagem de 15–16/11/2026) e dois croquis ilustrativos |
| **Relacionados** | 0012, 0014, 0015 |


> **Atualização (registro 0017, 16/11/2026):** as perguntas da seção 5 foram respondidas e o modelo mudou: não há manifestações (a instituição cria devolutivas), só Aluno e Coordenação, categorias únicas para etiquetas e barras, e a cor das categorias fica no banco. Veja `0017-devolutivas-categorias-e-forms.md`. O laranja provisório da "Impertinente" (seção 3.2) foi descartado: Impertinente é vermelha.

## 1. Pedido

Dois elementos novos, usando cores, tipografia e elementos do projeto (os croquis são só ilustrativos):

1. **Botão para ver a justificativa de uma devolutiva** (croqui: botão "resposta" ao lado da etiqueta de status no Mural).
2. **Campo para adicionar um título** na criação de uma devolutiva/resposta (croqui: "Título da resposta" / "Escreva o título").

## 2. Respostas do usuário às perguntas do 0015

| # | Resposta |
|---|---|
| 1 | As **manifestações são a pergunta final do Google Forms** preenchido. Cabe à **área responsável se pronunciar** (caso as reclamações sejam muitas). Daí os dois elementos novos acima |
| 2 | A chave composta de `respostas` é um erro; será substituída por uma **surrogate key** |
| 3 | Os formulários são feitos no **Google Forms**; o portal **apenas pega as respostas** e as implementa visualmente (abstraindo o formulário) |
| 4 | As contas são criadas **pela instituição, a partir de um banco interno já existente**: não é preocupação do projeto. As **roles definem permissões e visualização**: **Alunos não acessam** "Resultados da Pesquisa CPA" nem "Responder Devolutiva"; **Professores ou Coordenação acessam tudo** |
| 4b | As categorias da resposta são **Inapto, Impertinente e Resolvido**. A ideia é **puxar as etiquetas do próprio banco de dados, cada uma com uma cor** |
| 5 | O nome do arquivo `prisma7.config.ts` não foi escolha do usuário: o processo de inicialização já o criou assim, possivelmente por causa da versão do Prisma |

## 3. O que foi criado ou alterado

### 3.1 Botão "Ver resposta" e janela da justificativa (Mural)

- No Mural, cada manifestação **com resposta** mostra o botão **Ver resposta**, à esquerda da etiqueta de status (cápsula azul-marinho com contorno claro, 22u de altura, fonte 16u). A manifestação sem resposta ("Pedido em Análise") não mostra o botão.
- O clique abre a janela **Resposta da Devolutiva** (560 × 330u, centralizada, mesmo estilo do Mural): título em barra azul-marinho; bloco com **Título**, **Área responsável**, **etiqueta da categoria** (texto e cor da própria categoria) e **Justificativa** (caixa cinza com rolagem real).
- Dados de exemplo: manifestação 1 (Secretaria, *Impertinente*, "Reembolso não faz parte da pesquisa CPA") e manifestação 3 (Infraestrutura, *Resolvido*, "Nova área de convivência").
- Nos itens recolhidos que ganham o botão, a caixa de texto ficou mais estreita (250u em vez de 311u) para não encostar nos botões.

### 3.2 Etiquetas de categoria vindas do banco

- Novo componente `EtiquetaCategoria`: recebe uma categoria `{ id, rotulo, cor }` e pinta a etiqueta com a **cor da categoria** (estilo inline), sem classes de cor fixas.
- Categorias de exemplo (`CATEGORIAS_RESPOSTA`): **Resolvido** `#00e000`, **Inapto** `#f20000`, **Impertinente** `#ff9f1a` (laranja **provisório**: a cor real virá do banco).
- Essas categorias também alimentam o dropdown "Categoria da resposta".
- As etiquetas de status do Mural (Não Procede / Pedido em Análise / Concluído) e as barras da Central **não foram alteradas**: falta definir como passam a derivar das categorias do banco (ver seção 5).

### 3.3 Campo "Título da resposta"

- Em `/devolutivas/responder`, novo campo **Título da resposta** (`Input`, placeholder "Escreva o título") no topo do cartão, ocupando a largura toda.
- O cartão passou de 640 × 360 para **640 × 400u** (32u abaixo do centro); os demais campos desceram 72u.
- O dropdown de categoria agora vem com **Resolvido** selecionado (igual ao projeto do usuário, visto na imagem do 0015), sem a opção "Selecione a categoria".

### 3.4 Perfis e comentários

- Comentários `TODO` das telas `/resultados`, `/devolutivas/responder` e do painel trocaram "somente administrador" por **"não acessível ao perfil aluno; professor e coordenação veem tudo"**. O marcador `data-somente="administrador"` nos botões do painel foi mantido (ver pergunta 2 da seção 5).

## 4. Arquivos

| Arquivo | Alteração |
|---|---|
| `src/components/devolutivas/resposta-dialog.tsx` | **Novo**: botão "Ver resposta" + janela da justificativa |
| `src/components/devolutivas/etiqueta-categoria.tsx` | **Novo**: etiqueta com texto e cor da categoria |
| `src/app/cpa-resposta.css` | **Novo**: estilos do botão, do grupo de ações e da janela de resposta (**não altera `cpa.css`**) |
| `src/lib/devolutivas-data.ts` | `CATEGORIAS_RESPOSTA`, tipo `RespostaDevolutiva`, campo `resposta?` em `Manifestacao`, exemplos com resposta |
| `src/components/devolutivas/mural-dialog.tsx` | Botão "Ver resposta" ao lado das etiquetas; caixas de texto mais estreitas nos itens com resposta (mantém `translate-x-0 translate-y-0` do 0015) |
| `src/components/devolutivas/form-resposta.tsx` | Campo título; categorias de `CATEGORIAS_RESPOSTA`; novas posições (cartão 640 × 400) |
| `src/app/devolutivas/responder/page.tsx` | Cartão 640 × 400; comentário de acesso |
| `src/app/resultados/page.tsx`, `src/components/status-pesquisa.tsx` | Só comentários de acesso |
| `docs/registros/0014-…`, `0015-…`, `INDEX.md`, `README.md` | Atualizados |

**Atenção ao substituir arquivos:** `form-resposta.tsx` e `responder/page.tsx` podem ter ajustes seus que o assistente não conhece (por exemplo, a lista de áreas e a categoria já selecionada, vistas só em imagem). Compare antes de substituir. O `cpa.css` **não** foi alterado de propósito.

## 5. Perguntas em aberto

1. **Ligação resposta ↔ manifestação:** uma resposta (com título) vale para **várias manifestações** (quando "as reclamações são muitas") ou cada manifestação tem a sua? Isso decide a tabela de ligação e o botão "Ver resposta" de cada item do Mural.
2. **Perfis:** a lista de roles será aluno, professor, coordenação (e administrador? avaliador externo?). O que o **avaliador externo** pode ver? (Hoje o código chama as telas restritas de "administrador".)
3. **Pesquisa (`/pesquisa`) e Resultados:** o aluno preenche o Google Forms **dentro do portal** (interface própria que envia ao Google) ou o botão "Acessar" abre o formulário do Google? De onde o portal lê as respostas (API do Google Forms, planilha vinculada)?
4. **Etiquetas e barras:** com as categorias do banco (Resolvido, Inapto, Impertinente), que etiqueta e cor tem uma manifestação **ainda sem resposta** (hoje "Pedido em Análise", amarela)? E as barras da Central (Não Procedidas / Em Análise / Procedidas) passam a contar por categoria?
5. **Cor das etiquetas:** em qual coluna fica a cor (por exemplo, `cor` em uma tabela `categorias`) e em que formato (hexadecimal)? A cor da "Impertinente" é provisória.

## 6. Verificação

Os componentes reais foram renderizados em navegador (com shadcn, `Link` e ícones simplificados): Mural com os botões, janela "Resposta da Devolutiva" e `/devolutivas/responder` com o campo de título, sem rolagem da página. O projeto Next em si não foi executado aqui. O comportamento de abrir uma janela dentro da outra depende do `Dialog` (Radix) do projeto real e deve ser conferido no navegador.
