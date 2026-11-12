import type { Metadata } from "next";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { LoginForm } from "@/components/login-form";
import { RedeDePontos } from "@/components/rede-de-pontos";
import { band, box, size, u } from "@/lib/cpa-box";

export const metadata: Metadata = { title: "Login · Portal CPA" };

export default function PaginaLogin() {
  return (
    <div className="cpa-root cpa-root--login">
      <div className="cpa-stage">
        <RedeDePontos />

        <BarraInstitucional as="header" style={band({ left: 14, right: 14, top: 22, h: 68 })} />

        <main style={{ display: "contents" }}>
          <section
            className="cpa-card cpa-center"
            style={size(588, 284)}
            aria-labelledby="titulo-login"
          >
            <h1
              id="titulo-login"
              className="cpa-pill"
              style={box(226, 12, 131, 48, { borderRadius: u(24), fontSize: u(16) })}
            >
              Login - CPA
            </h1>
            <LoginForm />
          </section>
        </main>

        <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 21, h: 68 })} />
      </div>
    </div>
  );
}
