import { GraficoStatus } from "@/components/devolutivas/grafico-status";
import type { AnoDevolutivas } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

type Props = {
  item: AnoDevolutivas;
};

export function CartaoAno({ item }: Props) {
  return (
    <>
      <div className="cpa-year-head" style={box(0, 0, 270, 56)}>
        <span style={{ fontSize: u(30) }}>{item.ano}</span>
      </div>

      <p
        className="cpa-year-sub"
        style={box(10, 72, 250, 18, {
          fontSize: u(10.5),
          lineHeight: u(14),
          textAlign: "center",
          margin: 0,
        })}
      >
        Número de Sugestões por Tipo de Deferimento
      </p>

      <div style={box(14, 102, 242, 176)}>
        <GraficoStatus ano={item.ano} contagem={item.contagem} />
      </div>
    </>
  );
}