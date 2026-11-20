import type { CSSProperties } from "react";

/**
 * Converte uma medida do mockup 008 (px numa moldura de 960 × 540) para CSS escalável.
 * u(30) → "calc(30 * var(--u))"; a variável --u é definida em src/app/cpa.css e se ajusta
 * ao tamanho da janela.
 */
export const u = (n: number) => `calc(${n} * var(--u))`;

/**
 * Posiciona um elemento dentro do seu contêiner: x, y (canto superior esquerdo), largura
 * e altura em px do mockup. O terceiro argumento acrescenta outras propriedades.
 */
export function box(x: number, y: number, w: number, h: number, extra: CSSProperties = {}): CSSProperties {
  return {
    position: "absolute",
    left: u(x),
    top: u(y),
    width: u(w),
    height: u(h),
    ...extra,
  };
}

export function size(w: number, h: number, extra: CSSProperties = {}): CSSProperties {
  return { width: u(w), height: u(h), flex: "none", ...extra };
}

/**
 * Faixa que acompanha a largura da janela: distâncias das bordas (em px do mockup).
 * Ex.: band({ left: 14, right: 14, top: 22, h: 68 }) é a barra do topo do login.
 * Omita `h` para a faixa esticar entre `top` e `bottom`.
 */
export function band(
  o: { left?: number; right?: number; top?: number; bottom?: number; h?: number },
  extra: CSSProperties = {},
): CSSProperties {
  const s: CSSProperties = { position: "absolute", ...extra };
  if (o.left !== undefined) s.left = u(o.left);
  if (o.right !== undefined) s.right = u(o.right);
  if (o.top !== undefined) s.top = u(o.top);
  if (o.bottom !== undefined) s.bottom = u(o.bottom);
  if (o.h !== undefined) s.height = u(o.h);
  return s;
}
