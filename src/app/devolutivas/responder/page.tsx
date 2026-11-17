import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { FormResposta } from "@/components/devolutivas/form-resposta";
import { Button } from "@/components/ui/button";
import { band, box, size, u } from "@/lib/cpa-box";
import { exigirAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Responder Devolutiva · Portal CPA" };

/**
 * Tela restrita à coordenação (o perfil aluno não acessa) (visual).
 * TODO (implementação): restringir por perfil (tabela `roles`) e definir como a devolutiva é criada (título, área, categoria, motivo).
 */
export default async function PaginaResponderDevolutiva() {
  await exigirAdmin();
  return (
    <div className="cpa-root">
      <div className="cpa-stage">
        <BarraInstitucional as="header" style={band({ left: 10, right: 10, top: 13, h: 68 })}>
          <Button
            asChild
            className="cpa-btn cpa-btn--ghost"
            style={box(34, 17, 40, 34, { borderRadius: u(17) })}
          >
            <Link href="/inicio" aria-label="Voltar" title="Voltar">
              <ArrowLeft aria-hidden style={{ width: u(26), height: u(26) }} />
            </Link>
          </Button>
          <h1 style={{ fontSize: u(36) }}>Responder Devolutiva</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <section
            className="cpa-card cpa-center"
            style={{ ...size(640, 400), top: `calc(50% + ${u(32)})` }}
            aria-label="Resposta da devolutiva"
          >
            <FormResposta />
          </section>
        </main>
      </div>
    </div>
  );
}
