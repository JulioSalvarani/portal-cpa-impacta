import type { PerfilCpa } from "@/lib/auth";

export type UsuarioPerfilItem = {
  user_id: string;
  nome: string;
  email: string;
  role: PerfilCpa;
};

export const OPCOES_PERFIL: { valor: PerfilCpa; rotulo: string }[] = [
  { valor: "aluno", rotulo: "Aluno" },
  { valor: "coordenador", rotulo: "Coordenador" },
  { valor: "avaliador_externo", rotulo: "Avaliador Externo (MEC)" },
  { valor: "admin", rotulo: "Administrador (CPA)" },
];