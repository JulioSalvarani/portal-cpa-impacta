import type { CSSProperties } from "react";

/**
 * Faixa azul-marinho de cabeçalho/rodapé (vazia nos mockups).
 * Posicione com band({...}) de "@/lib/cpa-box". Aceita filhos (posicionados dentro da faixa).
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
