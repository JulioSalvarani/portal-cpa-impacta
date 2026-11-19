# Registro nº 0011 — Tela cheia, barra de rolagem real e modal centralizado

| Campo | Valor |
|---|---|
| **Número** | 0011 |
| **Data da alteração** | 11/11/2026, 18:16 (America/Sao_Paulo) |
| **Tipo** | Atualização (substitui arquivos do registro 0010) |
| **Origem** | Prints do usuário rodando o registro 0010 em `localhost:3000` |

## Problemas relatados e correções

| # | Problema | Causa | Correção |
|---|---|---|---|
| 1 | Proporção das telas ruim (`/inicio`) | A moldura fixa 16:9 deixava faixas vazias nas laterais em janelas largas e baixas, a foto/círculo de fundo ficava cortado e a página ainda rolava | Telas ocupam a **janela inteira**: barras de ponta a ponta, conteúdo centralizado e tamanhos do mockup escalados pelo menor lado da janela (`--u = min(largura/960, altura/540)`). Rolagem da página desativada nessas telas |
| 2 | Barra de rolagem de `/devolutivas` não funciona | Era só um desenho (elemento decorativo) | Fileira de cards virou uma **área rolável real** com barra horizontal no formato do mockup (arraste a barra ou use shift + roda do mouse). Acrescentados os anos 2023 e 2022 de exemplo, para haver o que rolar |
| 3 | Popup fora da área interativa | O Tailwind v4 usa a propriedade `translate` para centralizar o diálogo; o CSS do registro 0010 aplicava um segundo deslocamento (`transform`), somando −100% | Modal centralizado com `inset: 0; margin: auto`, sem `transform`, e `translate`, `scale` e `animation` anulados |
| 4 | Faixa vazia acima do ano em cada card | `<button>` centraliza o conteúdo na vertical | Card em flex coluna, alinhado ao topo |

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/app/cpa.css` | `--u` por menor lado da janela, `html/body` sem rolagem, `.cpa-center`, `.cpa-years` (rolagem), modal sem transform, card em coluna |
| `src/lib/cpa-box.ts` | **Novas funções** `size()` (só largura/altura) e `band()` (faixa ancorada às bordas); `box()` e `u()` continuam |
| `src/app/login/page.tsx`, `src/app/inicio/page.tsx`, `src/app/pesquisa/page.tsx` | Barras ancoradas às bordas e conteúdo centralizado |
| `src/components/home-header.tsx`, `src/components/status-pesquisa.tsx` | Cabeçalho em flex; botões e banner relativos ao bloco central |
| `src/components/barra-institucional.tsx` | Aceita filhos; centraliza conteúdo |
| `src/components/devolutivas/painel-devolutivas.tsx` | Painel flexível e fileira rolável |
| `src/components/devolutivas/grafico-status.tsx` | Valor 0 desenha uma barra mínima (3 px) em vez de 17 |
| `src/lib/devolutivas-data.ts` | Anos 2023 e 2022 de exemplo (apague-os para mostrar só 2026, 2025 e 2024) |

## Verificação

O CSS foi conferido em navegador com o mesmo markup, simulando as classes do shadcn v4, em quatro tamanhos de janela (1360×605, 1920×1080, 1024×768 e 700×900): sem rolagem da página, modal centralizado, fileira de cards rolável. **O projeto Next em si não foi executado aqui.**

## Observações

- Em janelas muito altas e estreitas (retrato), o conteúdo fica pequeno porque a escala segue o menor lado. Um layout próprio para celular ainda não foi feito.
- O escurecimento atrás do modal é o padrão do shadcn.
