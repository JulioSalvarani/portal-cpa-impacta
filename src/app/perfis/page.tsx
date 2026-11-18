import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { TabelaPerfis } from "@/components/perfis/tabela-perfis";
import { Button } from "@/components/ui/button";
import { exigirAdmin, normalizarPerfil } from "@/lib/auth";
import { band, box, u } from "@/lib/cpa-box";
import type { UsuarioPerfilItem } from "@/lib/perfis-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Gerenciar Perfis · Portal CPA" };

export default async function PaginaPerfis() {
  await exigirAdmin();

  const perfisLista = await prisma.profiles.findMany({
    include: { roles: true },
    orderBy: [{ nome: "asc" }, { email: "asc" }],
  });

  const usuarios: UsuarioPerfilItem[] = perfisLista.map((p) => {
    const email = p.email ?? "";
    const nomeFallback = email.includes("@") ? email.split("@")[0] : "Usuário";

    return {
      user_id: p.user_id,
      nome: (p.nome ?? "").trim() || nomeFallback,
      email,
      role: normalizarPerfil(p.roles?.role),
    };
  });

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
          <h1 style={{ fontSize: u(36) }}>Gerenciar Perfis</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <div className="cpa-panel" style={band({ left: 14, right: 14, top: 96, bottom: 72 })}>
            <TabelaPerfis usuariosIniciais={usuarios} />
          </div>
        </main>

        <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 14, h: 44 })} />
      </div>
    </div>
  );
}