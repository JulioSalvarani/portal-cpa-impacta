import type { Metadata } from "next";
import "@/app/cpa.css";
import { PainelDevolutivas } from "@/components/devolutivas/painel-devolutivas";
import { exigirUsuarioLogado, type PerfilCpa } from "@/lib/auth";
import {
  normalizarSlugStatus,
  type AnoDevolutivas,
  type Devolutiva,
} from "@/lib/devolutivas-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Central de Devolutivas · Portal CPA" };

export default async function PaginaDevolutivas() {
  const usuario = await exigirUsuarioLogado();
  const isAdmin = usuario.role === "admin";

  const [statusLista, respostasLista, areasLista] = await Promise.all([
    prisma.status_respostas.findMany({ orderBy: { id: "asc" } }),
    prisma.respostas.findMany({
      where: {
        perfis_permitidos: { has: usuario.role },
      },
      orderBy: [{ ano: "desc" }, { id: "desc" }],
    }),
    isAdmin
      ? prisma.areas.findMany({ orderBy: { nome_area: "asc" } })
      : Promise.resolve([]),
  ]);

  const slugPorStatusId = new Map<string, string>();
  for (const st of statusLista) {
    slugPorStatusId.set(st.id.toString(), normalizarSlugStatus(st.status));
  }

  const contagemPorAno = new Map<number, Record<string, number>>();
  const devolutivasPorAno: Record<number, Devolutiva[]> = {};

  for (const item of respostasLista) {
    const anoNumero = Number(item.ano ?? new Date().getFullYear());
    const statusKey = item.status?.toString() ?? "";
    const categoriaSlug = slugPorStatusId.get(statusKey) ?? "resolvido";

    if (!contagemPorAno.has(anoNumero)) {
      contagemPorAno.set(anoNumero, {
        impertinente: 0,
        inapto: 0,
        resolvido: 0,
      });
    }

    const contador = contagemPorAno.get(anoNumero)!;
    contador[categoriaSlug] = (contador[categoriaSlug] ?? 0) + 1;

    if (!devolutivasPorAno[anoNumero]) {
      devolutivasPorAno[anoNumero] = [];
    }

    devolutivasPorAno[anoNumero].push({
      id: item.id.toString(),
      ano: anoNumero,
      titulo: item.title ?? "Sem título",
      area: item.area ?? "Não informada",
      categoria: categoriaSlug,
      statusId: statusKey,
      justificativa: item.resposta ?? "",
      perfisPermitidos: (item.perfis_permitidos ?? [
        "aluno",
        "coordenador",
        "avaliador_externo",
        "admin",
      ]) as PerfilCpa[],
    });
  }

  const resumoAnos: AnoDevolutivas[] = Array.from(contagemPorAno.entries())
    .sort(([anoA], [anoB]) => anoB - anoA)
    .map(([ano, contagem]) => ({
      ano,
      contagem,
    }));

  const areas = areasLista.map((a) => a.nome_area);
  const categorias = statusLista
    .filter((s) => Boolean(s.status?.trim()))
    .map((s) => ({
      id: s.id.toString(),
      rotulo: s.status!.trim(),
    }));

  return (
    <div className="cpa-root">
      <div className="cpa-stage">
        <PainelDevolutivas
          resumoAnos={resumoAnos}
          devolutivasPorAno={devolutivasPorAno}
          isAdmin={isAdmin}
          areas={areas}
          categorias={categorias}
        />
      </div>
    </div>
  );
}