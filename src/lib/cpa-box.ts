import type { CSSProperties } from "react";

/**
 * Converte uma medida do mockup 008 (px numa moldura de 960 × 540) para CSS escalável.
 * u(30) → "calc(30 * var(--u))"; a variável --u é definida em src/app/cpa.css.
 */
export const u = (n: number) => `calc(${n} * var(--u))`;

/**
 * Posiciona um elemento como no mockup: x, y (canto superior esquerdo), largura e altura em px do mockup.
 * Dentro de um cartão ou modal, as coordenadas são relativas ao próprio cartão/modal.
 * O terceiro argumento acrescenta outras propriedades (fontSize, borderRadius...).
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
