import { ORDEM_STATUS, ROTULO_BARRA, type StatusDevolutiva } from "@/lib/devolutivas-data";
import { u } from "@/lib/cpa-box";

const CLASSE_BARRA: Record<StatusDevolutiva, string> = {
  "nao-procede": "cpa-bar-negado",
  "em-analise": "cpa-bar-analise",
  "concluido": "cpa-bar-concluido",
};

/** Altura de cada unidade do gráfico, em px do mockup (6 unidades = 102 px). */
const PX_POR_UNIDADE = 17;

type Props = {
  contagem: Record<StatusDevolutiva, number>;
  ano: number;
};

/** Gráfico de barras: vermelha (Não Procedidas), amarela (Em Análise), verde (Procedidas). */
export function GraficoStatus({ contagem, ano }: Props) {
  const resumo = ORDEM_STATUS.map((s) => `${ROTULO_BARRA[s]}: ${contagem[s]}`).join("; ");

  return (
    <figure>
      <div
        role="img"
        aria-label={`Sugestões de ${ano} por tipo de deferimento. ${resumo}.`}
        className="cpa-chart"
      >
        {ORDEM_STATUS.map((status) => (
          <div key={status} className="cpa-col">
            <b>{contagem[status]}</b>
            <i
              className={CLASSE_BARRA[status]}
              style={{ height: u(contagem[status] === 0 ? 3 : contagem[status] * PX_POR_UNIDADE) }}
            />
          </div>
        ))}
      </div>

      <figcaption className="cpa-labs">
        {ORDEM_STATUS.map((status) => (
          <span key={status}>{ROTULO_BARRA[status]}</span>
        ))}
      </figcaption>
    </figure>
  );
}
