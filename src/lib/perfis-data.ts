import type { PerfilCpa } from "@/lib/auth";

export type UsuarioPerfilItem = {
  user_id: string;
  nome: string;
  email: string;
  role: PerfilCpa;
};

/** Perfis institucionais: o e-mail precisa conter "impacta". Só `avaliador_externo` (MEC) é isento. */
export const PERFIS_EXIGEM_IMPACTA: ReadonlySet<PerfilCpa> = new Set<PerfilCpa>([
  "aluno",
  "professor",
  "coordenador",
  "admin",
]);

export const MENSAGEM_EMAIL_IMPACTA =
  "Perfis institucionais (aluno, professor, coordenador e admin) devem conter 'impacta' no e-mail.";

/** Retorna `true` se o e-mail é aceito para o cargo informado (verificação sem diferenciar maiúsculas). */
export function emailValidoParaPerfil(email: string, role: PerfilCpa): boolean {
  if (!PERFIS_EXIGEM_IMPACTA.has(role)) return true;
  return email.trim().toLowerCase().includes("impacta");
}

export const OPCOES_PERFIL: { valor: PerfilCpa; rotulo: string }[] = [
  { valor: "aluno", rotulo: "Aluno" },
  { valor: "professor", rotulo: "Professor" },
  { valor: "coordenador", rotulo: "Coordenador" },
  { valor: "avaliador_externo", rotulo: "Avaliador Externo (MEC)" },
  { valor: "admin", rotulo: "Administrador (CPA)" },
];