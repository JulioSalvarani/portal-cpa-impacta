import { CATEGORIAS_RESPOSTA, ORDEM_BARRAS, type CategoriaResposta } from "@/lib/devolutivas-data";
import { u } from "@/lib/cpa-box";

const PX_POR_UNIDADE = 17;

type Props = {
  contagem: Record<string, number>;
  ano: number;
};

/**
 * Gráfico de barras da Central: uma barra por categoria da resposta (Impertinente, Inapto,
 * Resolvido). O nome e a cor de cada barra vêm da categoria (do banco de dados).
 */
export function GraficoStatus({ contagem, ano }: Props) {
  const categorias = ORDEM_BARRAS.map((id) => CATEGORIAS_RESPOSTA.find((c) => c.id === id)).filter(
    (c): c is CategoriaResposta => c !== undefined,
  );
  const resumo = categorias.map((c) => `${c.rotulo}: ${contagem[c.id] ?? 0}`).join("; ");

  return (
    <figure>
      <div
        role="img"
        aria-label={`Devolutivas de ${ano} por categoria de resposta. ${resumo}.`}
        className="cpa-chart"
      >
        {categorias.map((c) => {
          const n = contagem[c.id] ?? 0;
          return (
            <div key={c.id} className="cpa-col">
              <b>{n}</b>
              <i style={{ background: c.cor, height: u(n === 0 ? 3 : n * PX_POR_UNIDADE) }} />
            </div>
          );
        })}
      </div>

      <figcaption className="cpa-labs">
        {categorias.map((c) => (
          <span key={c.id}>{c.rotulo}</span>
        ))}
      </figcaption>
    </figure>
  );
}
