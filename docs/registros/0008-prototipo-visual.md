# Registro nº 0008 — Protótipo visual das 4 telas

| Campo | Valor |
|---|---|
| **Número** | 0008 |
| **Data da alteração** | 10/11/2026, 18:05 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Arquivo** | `prototipo/telas-cpa.html` |

## Motivo

Pedido do usuário: não são necessários processos internos (login real, sessão, rotas); o objetivo é ter as telas **visualmente definidas**: posição, localização dos componentes, tamanhos e cores.

## O que foi feito

- Página HTML única e autônoma, sem instalação de pacotes, com as 4 telas numa moldura de **960 × 540 px** (proporção dos mockups) e posições em pixels medidas das imagens enviadas:
  1. Login (barras superior/inferior, cartão cinza, título, E-Mail, Senha, Entrar).
  2. Painel principal (retorno, `i`, saudação, perfil "Administrador", banner "Pesquisa CPA 2026/2 Aberta" com ponto verde, Acessar, envelope, rodapé).
  3. Central de Devolutivas (busca, 3 cards com barras vermelha/amarela/verde, barra de rolagem horizontal).
  4. Modal "Mural de Devolutivas" (lista de manifestações com etiquetas Não Procede, Pedido em Análise e Concluído).
- Navegação por abas e pelos botões, apenas para visualizar as telas. Não há validação nem gravação de dados.
- Moldura escalada para caber em qualquer largura, inclusive celular.
- Legenda das cores e observações no rodapé da página.

## Pontos a confirmar

- Fundo do painel principal é um **espaço reservado**; a foto real entra no lugar.
- Valores das barras (2026, 2025, 2024) são exemplos.
- A fonte Share Tech Mono é uma aproximação da fonte dos mockups. Se souber a fonte original, informe.
- Rodapé da Central de Devolutivas foi posicionado de forma inteira (nos mockups ele aparece cortado).

## Relação com o projeto Next (registros 0001–0007)

O projeto Next + shadcn/ui segue no repositório como base de código. Partes de processo (autenticação de exemplo, cookie de sessão, middleware) **não fazem parte deste protótipo** e podem ser ignoradas ou removidas quando o usuário decidir.
