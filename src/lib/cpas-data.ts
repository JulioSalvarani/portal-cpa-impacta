import type { PerfilCpa } from "@/lib/auth";

export type CpaItem = {
  id: number;
  title: string;
  ano: number;
  semestre: number;
  form_link: string;
  is_active: boolean;
  perfil_permitido: PerfilCpa;
};

export const ROTULOS_PERFIL_CPA: Record<PerfilCpa, string> = {
  aluno: "Aluno",
  coordenador: "Coordenador",
  avaliador_externo: "Avaliador Externo (MEC)",
  admin: "Administrador (CPA)",
};