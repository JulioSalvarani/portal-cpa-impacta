import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { PainelRelatorios } from "@/components/relatorios/painel-relatorios";
import { Button } from "@/components/ui/button";
import { exigirUsuarioLogado, podeGerenciarRelatorios } from "@/lib/auth";
import { band, box, u } from "@/lib/cpa-box";
import { prisma } from "@/lib/prisma";
import type { RelatorioDocumento, TipoRelatorio } from "@/lib/relatorios-data";

export const metadata: Metadata = { title: "Relatórios e Boletins · Portal CPA" };

export default async function PaginaRelatorios() {
  const usuario = await exigirUsuarioLogado();

  const registros = await prisma.relatorios.findMany({
    orderBy: [{ ano: "desc" }, { id: "desc" }],
  });

  const documentos: RelatorioDocumento[] = registros.map((doc) => ({
    id: Number(doc.id),
    titulo: doc.titulo,
    tipo: doc.tipo as TipoRelatorio,
    ano: Number(doc.ano),
    arquivo_url: doc.arquivo_url,
  }));

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
          <h1 style={{ fontSize: u(36) }}>Relatórios e Boletins</h1>
        </BarraInstitucional>

        <main style={{ display: "contents" }}>
          <div className="cpa-panel" style={band({ left: 14, right: 14, top: 96, bottom: 72 })}>
            <PainelRelatorios
              documentosIniciais={documentos}
              podeGerenciar={podeGerenciarRelatorios(usuario.role)}
            />
          </div>
        </main>

        <BarraInstitucional as="footer" style={band({ left: 14, right: 14, bottom: 14, h: 44 })} />
      </div>
    </div>
  );
}