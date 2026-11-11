import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { ROTULO_ETIQUETA, type StatusDevolutiva } from "@/lib/devolutivas-data";
import { u } from "@/lib/cpa-box";

const CLASSE: Record<StatusDevolutiva, string> = {
  "nao-procede": "cpa-tag--negado",
  "em-analise": "cpa-tag--analise",
  concluido: "cpa-tag--concluido",
};

/**
 * Etiqueta de status do mural (vermelha, amarela ou verde, texto preto).
 * `style` recebe a posição dentro do item (right/top/bottom, em px do mockup via u()).
 */
export function EtiquetaStatus({
  status,
  style,
}: {
  status: StatusDevolutiva;
  style?: CSSProperties;
}) {
  return (
    <Badge
      className={`cpa-tag ${CLASSE[status]}`}
      style={{ height: u(22), lineHeight: u(22), fontSize: u(16), ...style }}
    >
      {ROTULO_ETIQUETA[status]}
    </Badge>
  );
}
