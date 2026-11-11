import type { Metadata } from "next";
import "@/app/cpa.css";
import { PainelDevolutivas } from "@/components/devolutivas/painel-devolutivas";

export const metadata: Metadata = { title: "Central de Devolutivas · Portal CPA" };

export default function PaginaDevolutivas() {
  return (
    <div className="cpa-root">
      <div className="cpa-stage">
        <PainelDevolutivas />
      </div>
    </div>
  );
}
