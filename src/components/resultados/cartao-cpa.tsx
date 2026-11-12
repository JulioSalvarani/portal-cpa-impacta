import { Download, FileText } from "lucide-react";
import { GraficoPizza } from "@/components/resultados/grafico-pizza";
import { Button } from "@/components/ui/button";
import type { CpaResultado, Questao } from "@/lib/resultados-data";

/**
 * Um "dropdown" de CPA (semestre): título com seta e, quando aberto, o gráfico da pergunta
 * escolhida, a lista de perguntas e os atalhos de baixar/relatório.
 * A troca de pergunta e o abrir/fechar funcionam só com HTML/CSS (rádios e <details>).
 * TODO (implementação): carregar os dados reais, ligar "baixar" e "relatório".
 */
export function CartaoCpa({
  cpa,
  questoes,
  aberto = false,
}: {
  cpa: CpaResultado;
  questoes: Questao[];
  aberto?: boolean;
}) {
  const nome = `perguntas-${cpa.id}`;

  return (
    <details className="cpa-cpa" open={aberto}>
      <summary>
        CPA - {cpa.periodo}
        <svg
          viewBox="0 0 22 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 2v23" />
          <path d="M3 17l8 8 8-8" />
        </svg>
      </summary>

      <div className="cpa-cpa-body">
        {questoes.map((q, i) => (
          <input
            key={q.id}
            className="cpa-sr"
            type="radio"
            name={nome}
            id={`${cpa.id}-q${q.id}`}
            value={q.id}
            defaultChecked={i === 0}
          />
        ))}

        {/* Gráfico ou linhas da pergunta escolhida */}
        <div className="cpa-res-chart">
          {questoes.map((q) => (
            <div key={q.id} className="cpa-res-panel" data-panel={q.id}>
              {q.tipo === "alternativa" ? (
                <GraficoPizza valores={q.valores} titulo={`${q.texto}, CPA ${cpa.periodo}`} />
              ) : (
                <ul className="cpa-lines" aria-label={`Respostas discursivas: ${q.texto}`}>
                  {q.respostas.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Lista de perguntas */}
        <div className="cpa-res-list" role="group" aria-label={`Perguntas da CPA ${cpa.periodo}`}>
          {questoes.map((q) => (
            <label key={q.id} className="cpa-q" htmlFor={`${cpa.id}-q${q.id}`} data-q={q.id}>
              {q.texto}
            </label>
          ))}
        </div>

        <div className="cpa-res-tools">
          <Button type="button" className="cpa-btn cpa-btn--ghost cpa-tool" aria-label="Baixar resultados" title="Baixar resultados">
            <Download aria-hidden />
          </Button>
          <Button type="button" className="cpa-btn cpa-btn--ghost cpa-tool" aria-label="Ver relatório" title="Ver relatório">
            <FileText aria-hidden />
          </Button>
        </div>
      </div>
    </details>
  );
}
