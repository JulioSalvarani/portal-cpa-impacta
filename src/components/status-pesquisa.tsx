import Link from "next/link";
import { Button } from "@/components/ui/button";
import { box, u } from "@/lib/cpa-box";

/**
 * PROTÓTIPO VISUAL: banner da pesquisa ativa e atalhos, com texto fixo.
 * TODO (implementação): período e estado (aberta/encerrada) vindos do back-end.
 */
export function StatusPesquisa() {
  return (
    <>
      <section
        role="status"
        aria-label="Pesquisa ativa"
        className="cpa-banner"
        style={box(88, 198, 782, 93)}
      >
        <h2 style={{ fontSize: u(42), whiteSpace: "nowrap" }}>Pesquisa CPA 2026/2 Aberta</h2>
        <span className="cpa-dot" role="img" aria-label="Pesquisa em andamento" />
      </section>

      <Button
        asChild
        className="cpa-btn cpa-btn--line"
        style={box(288, 346, 196, 72, { borderRadius: u(28), fontSize: u(25), gap: u(12) })}
      >
        <Link href="/pesquisa">
          Acessar
          <svg
            viewBox="0 0 44 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ width: u(44), height: u(16) }}
          >
            <path d="M1 8h4M10 8h4M19 8h4M28 8h13" />
            <path d="M35 2l6 6-6 6" />
          </svg>
        </Link>
      </Button>

      <Button
        asChild
        className="cpa-btn"
        style={box(535, 342, 122, 79, { borderRadius: u(28) })}
      >
        <Link href="/devolutivas" aria-label="Mensagens e devolutivas" title="Mensagens e devolutivas">
          <svg viewBox="0 0 58 44" aria-hidden="true" style={{ width: u(58), height: u(44) }}>
            <rect x="1.5" y="1.5" width="55" height="41" rx="5" fill="#f4f4f4" stroke="#fff" />
            <path d="M3 5l26 20L55 5" fill="none" stroke="#9aa3ad" strokeWidth="1.5" />
          </svg>
        </Link>
      </Button>
    </>
  );
}
