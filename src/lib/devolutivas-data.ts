import type { PerfilCpa } from "@/lib/auth";

export type CategoriaResposta = {
  id: string;
  rotulo: string;
  cor: string;
};

export type OpcaoStatusFormulario = {
  id: string;
  rotulo: string;
};

export const CATEGORIAS_RESPOSTA: CategoriaResposta[] = [
  { id: "resolvido", rotulo: "Resolvido", cor: "#0ee80e" },
  { id: "inapto", rotulo: "Inapto", cor: "#f3ef00" },
  { id: "impertinente", rotulo: "Impertinente", cor: "#f20000" },
];

export const ORDEM_BARRAS: string[] = ["impertinente", "inapto", "resolvido"];

export function normalizarSlugStatus(status?: string | null): string {
  const valor = (status ?? "").trim().toLowerCase();
  if (valor === "resolvido" || valor === "inapto" || valor === "impertinente") {
    return valor;
  }
  return "resolvido";
}

export const categoriaPorId = (
  id: string,
  lista: CategoriaResposta[] = CATEGORIAS_RESPOSTA,
): CategoriaResposta =>
  lista.find((c) => c.id === id) ??
  CATEGORIAS_RESPOSTA.find((c) => c.id === id) ??
  CATEGORIAS_RESPOSTA[0];

export type AnoDevolutivas = {
  ano: number;
  contagem: Record<string, number>;
};

export type Devolutiva = {
  id: string;
  ano: number;
  titulo: string;
  area: string;
  categoria: string;
  statusId?: string;
  justificativa: string;
  perfisPermitidos?: PerfilCpa[];
};