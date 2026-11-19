import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  Mail,
  MessageSquarePlus,
  UserCog,
} from "lucide-react";
import type { PerfilCpa } from "@/components/home-header";
import { Button } from "@/components/ui/button";
import { box, u } from "@/lib/cpa-box";

type Props = {
  titulo?: string;
  isActive?: boolean;
  formLink?: string;
  role?: PerfilCpa;
};

export function StatusPesquisa({
  titulo = "Pesquisa CPA 2026/2 Aberta",
  isActive = true,
  formLink = "https://docs.google.com/forms",
  role = "admin",
}: Props) {
  const isAdmin = role === "admin";

  return (
    <>
      <section
        role="status"
        aria-label="Pesquisa ativa"
        className="cpa-banner"
        style={box(0, 0, 782, 93, {
          justifyContent: "center",
          padding: `0 ${u(76)}`,
        })}
      >
        <h2
          style={{
            fontSize: titulo.length > 28 ? u(24) : u(42),
            textAlign: "center",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {titulo}
        </h2>
        <span
          className={isActive ? "cpa-dot" : "cpa-dot cpa-dot--closed"}
          role="img"
          aria-label={isActive ? "Pesquisa em andamento" : "Pesquisa encerrada"}
          style={{
            position: "absolute",
            right: u(36),
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </section>

      {isAdmin ? (
        <>
          {/* 1. Acessar formulário externo */}
          <Button
            asChild={isActive}
            aria-disabled={!isActive}
            className={`cpa-btn cpa-btn--line ${!isActive ? "cpa-btn--disabled" : ""}`}
            style={box(0, 148, 144, 72, { borderRadius: u(28), fontSize: u(19), gap: u(6) })}
          >
            {isActive ? (
              <a href={formLink} target="_blank" rel="noopener noreferrer">
                Acessar
                <svg
                  viewBox="0 0 44 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ width: u(28), height: u(14) }}
                >
                  <path d="M1 8h4M10 8h4M19 8h4M28 8h13" />
                  <path d="M35 2l6 6-6 6" />
                </svg>
              </a>
            ) : (
              <span>Encerrada</span>
            )}
          </Button>

          {/* 2. Central de Devolutivas */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(156, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link href="/devolutivas" aria-label="Central de Devolutivas" title="Central de Devolutivas">
              <Mail aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">Devolutivas</span>
            </Link>
          </Button>

          {/* 3. Resultados da Pesquisa */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(262, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link href="/resultados" aria-label="Resultados da Pesquisa" title="Resultados da Pesquisa">
              <BarChart3 aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">Resultados</span>
            </Link>
          </Button>

          {/* 4. Relatórios e Boletins */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(368, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link href="/relatorios" aria-label="Relatórios e Boletins" title="Relatórios e Boletins">
              <FileCheck2 aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">Relatórios</span>
            </Link>
          </Button>

          {/* 5. Responder Devolutiva (admin) */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(474, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link
              href="/devolutivas/responder"
              aria-label="Responder Devolutiva"
              title="Responder Devolutiva"
            >
              <MessageSquarePlus aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">Responder</span>
            </Link>
          </Button>

          {/* 6. Gerenciar CPAs (admin) */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(580, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link href="/cpas" aria-label="Gerenciar CPAs" title="Gerenciar CPAs">
              <ClipboardList aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">CPAs</span>
            </Link>
          </Button>

          {/* 7. Gerenciar Perfis (admin) */}
          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(686, 144, 96, 79, { borderRadius: u(24) })}
          >
            <Link href="/perfis" aria-label="Gerenciar Perfis" title="Gerenciar Perfis">
              <UserCog aria-hidden style={{ width: u(30), height: u(30) }} />
              <span className="cpa-shortcut-label">Perfis</span>
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button
            asChild={isActive}
            aria-disabled={!isActive}
            className={`cpa-btn cpa-btn--line ${!isActive ? "cpa-btn--disabled" : ""}`}
            style={box(22, 148, 196, 72, { borderRadius: u(28), fontSize: u(25), gap: u(12) })}
          >
            {isActive ? (
              <a href={formLink} target="_blank" rel="noopener noreferrer">
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
              </a>
            ) : (
              <span>Encerrada</span>
            )}
          </Button>

          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(254, 144, 148, 79, { borderRadius: u(28) })}
          >
            <Link href="/devolutivas" aria-label="Central de Devolutivas" title="Central de Devolutivas">
              <Mail aria-hidden style={{ width: u(36), height: u(36) }} />
              <span className="cpa-shortcut-label">Devolutivas</span>
            </Link>
          </Button>

          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(434, 144, 148, 79, { borderRadius: u(28) })}
          >
            <Link href="/resultados" aria-label="Resultados da Pesquisa" title="Resultados da Pesquisa">
              <BarChart3 aria-hidden style={{ width: u(36), height: u(36) }} />
              <span className="cpa-shortcut-label">Resultados</span>
            </Link>
          </Button>

          <Button
            asChild
            className="cpa-btn cpa-shortcut"
            style={box(614, 144, 148, 79, { borderRadius: u(28) })}
          >
            <Link href="/relatorios" aria-label="Relatórios e Boletins" title="Relatórios e Boletins">
              <FileCheck2 aria-hidden style={{ width: u(36), height: u(36) }} />
              <span className="cpa-shortcut-label">Relatórios</span>
            </Link>
          </Button>
        </>
      )}
    </>
  );
}