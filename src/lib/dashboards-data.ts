import type { PerfilCpa } from "@/lib/auth";

export type DashboardCpa = {
  id: number;
  slug?: string;
  titulo: string;
  embed_url: string;
  embed_url_externo?: string | null;
  ordem: number;
  ativo: boolean;
  perfis: PerfilCpa[];
};