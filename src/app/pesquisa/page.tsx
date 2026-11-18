import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/app/cpa.css";
import { BarraInstitucional } from "@/components/barra-institucional";
import { Button } from "@/components/ui/button";
import { band, box, size, u } from "@/lib/cpa-box";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Pesquisa CPA · Portal CPA" };

export default function PaginaPesquisa() {
  redirect("/inicio");
}