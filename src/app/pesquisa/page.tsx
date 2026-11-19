import type { Metadata } from "next";
import "@/app/cpa.css";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Pesquisa CPA · Portal CPA" };

export default function PaginaPesquisa() {
  redirect("/inicio");
}