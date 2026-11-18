import { Info } from "lucide-react";
import type { DashboardCpa } from "@/lib/dashboards-data";
import { u } from "@/lib/cpa-box";

type Props = {
  dashboard: DashboardCpa;
  aberto?: boolean;
  usarLinkExterno?: boolean;
};

/**
 * Acordeão de Resultados da Pesquisa CPA (Registro nº 0019):
 * - Cada `<details>` representa um público da CPA (Presencial, EAD, Professores, Técnico-Adm.)
 * - Incorpora o `<iframe>` do Google Data Studio / Looker Studio com filtros nativos
 */
export function CartaoCpa({ dashboard, aberto = false, usarLinkExterno = false }: Props) {
  const urlFinal =
    usarLinkExterno && dashboard.embed_url_externo
      ? dashboard.embed_url_externo
      : dashboard.embed_url;

  return (
    <details className="cpa-cpa" open={aberto}>
      <summary>
        CPA · {dashboard.titulo}
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
        <div className="cpa-embed-notice" role="note">
          <span style={{ display: "flex", alignItems: "center", gap: u(8) }}>
            <Info aria-hidden style={{ width: u(18), height: u(18), flex: "none" }} />
            {usarLinkExterno
              ? "Visualização externa (Avaliador MEC): utilize os filtros de Ano, Semestre e Ciclo no painel."
              : "Para o painel do Google Data Studio carregar, esteja logado no navegador com sua conta Google @impacta."}
          </span>
          <span>Google Data Studio</span>
        </div>

        <div className="cpa-embed-wrap">
          {urlFinal ? (
            <iframe
              src={urlFinal}
              title={`Relatório CPA - ${dashboard.titulo}`}
              width="100%"
              height="1600"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="cpa-embed-placeholder">
              <div className="cpa-embed-toolbar">
                <span>Looker Studio · {dashboard.titulo}</span>
                <div className="cpa-embed-filters">
                  <span className="cpa-embed-chip">ANO ▾</span>
                  <span className="cpa-embed-chip">Semestre ▾</span>
                  <span className="cpa-embed-chip">Ciclo ▾</span>
                  <span className="cpa-embed-chip">Download ⤓</span>
                </div>
              </div>

              <div className="cpa-embed-grid">
                <div className="cpa-embed-kpi">
                  <span>Participação Geral</span>
                  <strong>84,2%</strong>
                </div>
                <div className="cpa-embed-kpi">
                  <span>Satisfação Institucional</span>
                  <strong>4,6 / 5,0</strong>
                </div>
                <div className="cpa-embed-kpi">
                  <span>Respostas Validadas</span>
                  <strong>1.420</strong>
                </div>
              </div>

              <p style={{ fontSize: u(13), color: "#444", textAlign: "center", marginTop: u(8) }}>
                Área reservada para o <code>&lt;iframe&gt;</code> oficial do Google Data Studio (coluna{" "}
                <code>embed_url</code> de <code>dashboards_cpa</code>).
              </p>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}