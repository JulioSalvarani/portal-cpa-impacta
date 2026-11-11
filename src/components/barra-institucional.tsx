import type { CSSProperties } from "react";

/**
 * Faixa azul-marinho de cabeçalho/rodapé (vazia nos mockups).
 * Posicione com box(x, y, w, h) de "@/lib/cpa-box".
 */
export function BarraInstitucional({
  as: Tag = "div",
  style,
  children,
}: {
  as?: "div" | "header" | "footer";
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <Tag className="cpa-bar" style={style} aria-hidden={children ? undefined : true}>
      {children}
    </Tag>
  );
}
