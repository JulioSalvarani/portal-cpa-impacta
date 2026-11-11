# Registro nº 0009 — Protótipo visual em Next + shadcn/ui (sem lógica)

| Campo | Valor |
|---|---|
| **Número** | 0009 |
| **Data da alteração** | 10/11/2026, 18:09 (America/Sao_Paulo) |
| **Tipo** | Atualização (substitui arquivos dos registros 0001–0005) |
| **Base visual** | Protótipo aprovado no registro 0008 |

## Motivo

O usuário aprovou o protótipo visual e pediu a versão em Next usando shadcn/ui, **somente visual**, deixando as funções para ele implementar.

## O que mudou

Foram **removidos dos arquivos** todos os processos: sessão por cookie, Server Action de login, validação, middleware com redirecionamento, busca com filtro e expansão de itens no mural. Ficou apenas layout, tamanhos e cores. Pontos de implementação ficaram marcados com `TODO (implementação)` nos comentários.

| Arquivo | Alteração |
|---|---|
| `src/app/globals.css` | Cores do mockup (`#012A55`, `#D9D9D9`, status e barras), fundos `.bg-login` e `.bg-home` |
| `src/app/page.tsx` | Raiz redireciona para `/login` |
| `src/middleware.ts` | Passou a deixar tudo passar (sem proteção de rotas) |
| `src/app/login/page.tsx` | Tela de login com rede de pontos de fundo |
| `src/components/login-form.tsx` | Campos E-Mail/Senha e botão Entrar (link para `/inicio`), sem envio |
| `src/components/rede-de-pontos.tsx` | **Novo.** SVG decorativo do fundo do login |
| `src/components/barra-institucional.tsx` | Rodapé agora é faixa azul vazia, como no mockup |
| `src/app/inicio/page.tsx` | Painel principal sem leitura de sessão |
| `src/components/home-header.tsx` | Saudação "[Usuário]" e perfil "Administrador" fixos |
| `src/components/status-pesquisa.tsx` | Banner, Acessar e envelope com texto fixo |
| `src/app/devolutivas/page.tsx` | Central sem leitura de sessão |
| `src/components/devolutivas/painel-devolutivas.tsx` | Cabeçalho, busca (sem filtro) e cards; o card abre o modal |
| `src/components/devolutivas/cartao-ano.tsx` | Card do ano |
| `src/components/devolutivas/grafico-status.tsx` | Barras vermelha, amarela e verde |
| `src/components/devolutivas/etiqueta-status.tsx` | Etiquetas com `Badge` do shadcn |
| `src/components/devolutivas/mural-dialog.tsx` | Modal com `Dialog` e `ScrollArea` do shadcn, 3 itens de exemplo |
| `src/lib/devolutivas-data.ts` | Só dados fixos e rótulos; funções de busca/contagem removidas |
| `docs/registros/` | Este registro, 0008 e o índice |

Componentes shadcn usados: `Button`, `Input`, `Label`, `Card`, `Badge`, `Dialog`, `ScrollArea` (já existentes no projeto; **nenhum arquivo de `src/components/ui/` foi alterado e nenhuma dependência nova foi adicionada**).

## Arquivos que ficaram sem uso (podem ser apagados)

`src/lib/auth-mock.ts`, `src/lib/session.ts`, `src/lib/perfis.ts`, `src/app/login/actions.ts` e a dependência `server-only` do `package.json`. Não são mais importados por nenhuma tela.

## Observações

- Layout responsivo (ocupa a tela inteira), não mais uma moldura fixa de 960 × 540. As proporções seguem o protótipo.
- Código **não compilado nem executado** neste ambiente (sem acesso à rede). Rodar `pnpm dev` e registrar qualquer correção.
- Foto de fundo do painel: `public/images/home-bg.jpg` (enquanto não existir, aparece um espaço reservado).
