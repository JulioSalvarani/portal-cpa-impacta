import type { Metadata } from "next";
import "@/app/cpa.css";
import { logoutAction } from "@/app/actions/auth";
import { BarraInstitucional } from "@/components/barra-institucional";
import { HomeHeader } from "@/components/home-header";
import { StatusPesquisa } from "@/components/status-pesquisa";
import { exigirUsuarioLogado } from "@/lib/auth";
import { band, size, u } from "@/lib/cpa-box";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Início · Portal CPA" };

export default async function PaginaInicial() {
  const usuario = await exigirUsuarioLogado();

  const cpa = await prisma.cpas.findFirst({
    where: {
      perfis_permitidos: { has: usuario.role },
    },
    orderBy: [{ is_active: "desc" }, { ano: "desc" }, { semestre: "desc" }, { id: "desc" }],
  });
  

  return (
    <div className="cpa-root cpa-root--home">
      <div className="cpa-stage cpa-home">
        <HomeHeader
          nome={usuario.nome}
          role={usuario.role}
          logoutAction={logoutAction}
        />

        <main style={{ display: "contents" }}>
          <div
            className="cpa-center"
            style={{ ...size(782, 223), top: `calc(50% + ${u(39.5)})` }}
          >
            <StatusPesquisa
              titulo={cpa?.title ?? "Nenhuma pesquisa CPA disponível para seu perfil"}
              isActive={Boolean(cpa?.is_active)}
              formLink={cpa?.form_link ?? "#"}
              role={usuario.role}
            />
          </div>
        </main>

        <BarraInstitucional
          as="footer"
          style={band({ left: 21, right: 21, bottom: 22, h: 60 })}
        />
      </div>
    </div>
  );
}