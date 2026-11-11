import { GraficoStatus } from "@/components/devolutivas/grafico-status";
import type { AnoDevolutivas } from "@/lib/devolutivas-data";

/**
 * Conteúdo do card de um ano: faixa com o ano, indicador "Número de Sugestões por Tipo
 * de Deferimento" e gráfico de barras. O contêiner (botão que abre o mural) fica no painel.
 */
export function CartaoAno({ item }: { item: AnoDevolutivas }) {
  return (
    <>
      <div className="cpa-year-head">{item.ano}</div>
      <p className="cpa-year-title">Número de Sugestões por Tipo de Deferimento</p>
      <GraficoStatus contagem={item.contagem} ano={item.ano} />
    </>
  );
}
