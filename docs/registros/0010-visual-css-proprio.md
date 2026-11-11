# Registro nº 0010 — Visual com CSS próprio, fiel ao mockup 008

| Campo | Valor |
|---|---|
| **Número** | 0010 |
| **Data da alteração** | 11/11/2026, 07:59 (America/Sao_Paulo) |
| **Tipo** | Atualização (substitui arquivos do registro 0009) |
| **Base visual** | Mockup do registro 0008 |

## Problema

Ao rodar o registro 0009 no projeto do usuário, as telas ficaram quebradas: fonte serifada, títulos em negrito padrão do navegador, cartões brancos, azul-marinho substituído por preto (#171717), listas com marcadores, ícone de voltar sobre o título e campos sem estilo.

Causa provável: o projeto foi recriado com o CLI do shadcn (Radix UI), que usa um tema próprio (cores neutras) e, provavelmente, uma versão do Tailwind diferente da que o registro 0009 presumia. Utilitários como `text-3xl`, `font-normal`, `absolute left-4`, `bg-primary` e `bg-card` dependiam do `globals.css` e do `tailwind.config.ts` enviados no 0009, que não casam com esse tema.

## Solução

O visual deixou de depender do Tailwind e do `globals.css`:

- **`src/app/cpa.css` (novo):** CSS puro com todas as cores, fontes e formas do mockup. Importa a fonte Share Tech Mono por conta própria (não depende do `layout.tsx`).
- **Moldura 16:9 de 960 × 540 px**, igual ao mockup 008, escalada à janela pela variável `--u` (1 unidade = 1 px do mockup). Tudo é posicionado com as mesmas medidas do mockup.
- **`src/lib/cpa-box.ts` (novo):** funções `box(x, y, w, h)` e `u(n)` que convertem medidas do mockup em CSS escalável. Para mover ou redimensionar um componente, altere esses números.
- Componentes shadcn mantidos para o comportamento: `Button`, `Input`, `Label`, `Dialog`, `Badge`. Posição e tamanho vão inline e a aparência vem de classes `cpa-*`, para vencer os estilos padrão do shadcn.
- O **fundo preto** foi trocado pelo azul-marinho `#012A55`, o cinza de painel `#D9D9D9` e as cores de status do mockup.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/app/cpa.css` | **Novo** |
| `src/lib/cpa-box.ts` | **Novo** |
| `src/app/pesquisa/page.tsx` | **Novo.** Página provisória do botão "Acessar" (faltava no projeto recriado; retornava 404) |
| `src/app/login/page.tsx`, `src/app/inicio/page.tsx`, `src/app/devolutivas/page.tsx` | Importam `cpa.css` e usam a moldura |
| `src/components/barra-institucional.tsx` | Faixa azul posicionada por `box()`; `RodapeCpa` removido |
| `src/components/rede-de-pontos.tsx` | Usa a classe `cpa-net` |
| `src/components/login-form.tsx`, `home-header.tsx`, `status-pesquisa.tsx` | Reescritos com `box()` |
| `src/components/devolutivas/*` (painel, cartao-ano, grafico-status, etiqueta-status, mural-dialog) | Reescritos com `box()`; a barra de rolagem do mural e da central é só visual |

## Pode apagar / restaurar

- `tailwind.config.ts` do registro 0001 (era do Tailwind 3 e não é usado).
- Se o seu `globals.css` começa com `@tailwind base;`, ele veio do registro 0009: **restaure o gerado pelo shadcn** (começa com `@import "tailwindcss"`). As telas do portal não dependem dele.
- Arquivos sem uso desde o registro 0009: `src/lib/auth-mock.ts`, `src/lib/session.ts`, `src/lib/perfis.ts`, `src/app/login/actions.ts`.

## Limitações

- A moldura mantém a proporção 16:9: em janelas mais altas que largas sobram faixas laterais ou superiores com a cor de fundo. Para o sistema final pode ser melhor um layout fluido (posso fazer em uma etapa seguinte).
- O escurecimento atrás do modal usa o padrão do shadcn (mais escuro que o mockup).
- O código do Next **não foi executado** aqui; o CSS foi conferido em um navegador com o mesmo markup (login, painel, central e mural).
