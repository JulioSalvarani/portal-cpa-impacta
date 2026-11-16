import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import type { CategoriaResposta } from "@/lib/devolutivas-data";
import { u } from "@/lib/cpa-box";

/**
 * Etiqueta de uma categoria de resposta (Resolvido, Inapto, Impertinente...).
 * O texto e a COR vêm da própria categoria (do banco de dados), não de classes fixas.
 * `style` recebe a posição dentro do item (em px do mockup via u()).
 */
export function EtiquetaCategoria({
  categoria,
  style,
}: {
  categoria: CategoriaResposta;
  style?: CSSProperties;
}) {
  return (
    <Badge
      className="cpa-tag"
      style={{
        height: u(22),
        lineHeight: u(22),
        fontSize: u(16),
        background: categoria.cor,
        ...style,
      }}
    >
      {categoria.rotulo}
    </Badge>
  );
}
