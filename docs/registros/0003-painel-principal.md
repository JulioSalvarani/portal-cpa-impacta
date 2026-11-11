# Registro nº 0003 — Página Inicial / Painel Principal

| Campo | Valor |
|---|---|
| **Número** | 0003 |
| **Data da alteração** | 09/11/2026, 20:46 (America/Sao_Paulo) |
| **Tipo** | Criação |
| **Rotas** | `/inicio` (painel) e `/pesquisa` (página provisória) |

## O que foi feito

- **Cabeçalho** (`src/components/home-header.tsx`): saudação "Seja bem vindo, [Usuário]!" e perfil ativo (ex.: "Administrador") no canto superior direito, com avatar.
- **Banner central** (`src/components/status-pesquisa.tsx`): "Pesquisa CPA 2026/2 Aberta" com ponto verde (pulsa só se o sistema permite animação) e texto alternativo "Pesquisa em andamento". Se `aberta` for falso, o texto muda para "Encerrada", o ponto fica cinza e o botão "Acessar" fica desabilitado.
- **Botão "Acessar →"**: leva a `/pesquisa`.
- **Botão de mensagem (envelope)**: leva à Central de Devolutivas (`/devolutivas`).
- **Ícones de navegação**: botão de retorno (canto superior esquerdo) e botão de informação (`i`), que abre uma janela com um resumo sobre a pesquisa CPA.
- Página `/inicio` protegida: sem sessão redireciona para `/login`.

## Decisões a confirmar

1. **Botão de retorno do painel** encerra a sessão e volta ao login (o painel é a primeira tela após o login, então não há tela anterior). Confirmar se é o comportamento desejado.
2. **`/pesquisa` é uma página provisória**, pois o formulário da pesquisa não foi especificado.
3. **Fundo com foto:** coloque a imagem em `public/images/home-bg.jpg`; enquanto não existir, aparece um degradê claro.
4. A pesquisa ativa ("2026/2", aberta) é um dado fixo de exemplo em `src/app/inicio/page.tsx`.

## Arquivos

`src/app/inicio/page.tsx`, `src/components/home-header.tsx`, `src/components/status-pesquisa.tsx`, `src/app/pesquisa/page.tsx`.
