import Link from "next/link";
import { Button } from "@/components/ui/button";
import { box, u } from "@/lib/cpa-box";

/**
 * PROTÓTIPO VISUAL: banner da pesquisa ativa e atalhos, com texto fixo.
 * Coordenadas relativas ao bloco central (782 × 223 no mockup, canto em x=88, y=198).
 * Os dois últimos botões (Resultados e Responder devolutivas) são só para administrador.
 * TODO (implementação): período e estado vindos do back-end; exibir os botões de administrador
 * apenas para o perfil "administrador".
 */
export function StatusPesquisa() {
  return (
    <>
      <section
        role="status"
        aria-label="Pesquisa ativa"
        className="cpa-banner"
        style={box(0, 0, 782, 93)}
      >
        <h2 style={{ fontSize: u(42), whiteSpace: "nowrap" }}>Pesquisa CPA 2026/2 Aberta</h2>
        <span className="cpa-dot" role="img" aria-label="Pesquisa em andamento" />
      </section>

      <Button
        asChild
        className="cpa-btn cpa-btn--line"
        style={box(50, 148, 196, 72, { borderRadius: u(28), fontSize: u(25), gap: u(12) })}
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
        style={box(286, 144, 122, 79, { borderRadius: u(28) })}
      >
        <Link href="/devolutivas" aria-label="Mensagens e devolutivas" title="Mensagens e devolutivas">
          <svg viewBox="0 0 58 44" aria-hidden="true" style={{ width: u(58), height: u(44) }}>
            <rect x="1.5" y="1.5" width="55" height="41" rx="5" fill="#f4f4f4" stroke="#fff" />
            <path d="M3 5l26 20L55 5" fill="none" stroke="#9aa3ad" strokeWidth="1.5" />
          </svg>
        </Link>
      </Button>

      {/* Somente administrador: resultados da pesquisa */}
      <Button
        asChild
        className="cpa-btn"
        data-somente="administrador"
        style={box(448, 144, 122, 79, { borderRadius: u(28) })}
      >
        <Link href="/resultados" aria-label="Resultados da pesquisa (administrador)" title="Resultados da pesquisa">
          <svg
            viewBox="0 0 44 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ width: u(46), height: u(42) }}
          >
            <path d="M3 37h38" />
            <rect x="7" y="21" width="8" height="16" />
            <rect x="18" y="7" width="8" height="30" />
            <rect x="29" y="14" width="8" height="23" />
          </svg>
        </Link>
      </Button>

      {/* Somente administrador: responder devolutivas */}
      <Button
        asChild
        className="cpa-btn"
        data-somente="administrador"
        style={box(610, 144, 122, 79, { borderRadius: u(28) })}
      >
        <Link
          href="/devolutivas/responder"
          aria-label="Responder devolutivas (administrador)"
          title="Responder devolutivas"
        >
          <svg
            viewBox="0 0 44 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ width: u(46), height: u(42) }}
          >
            <path d="M6 4h32a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H21l-9 8v-8H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
            <path d="M11 13h22M11 20h14" />
          </svg>
        </Link>
      </Button>
    </>
  );
}
