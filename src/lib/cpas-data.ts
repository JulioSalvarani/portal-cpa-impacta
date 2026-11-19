import type { PerfilCpa } from "@/lib/auth";

export type CpaItem = {
  id: number;
  title: string;
  ano: number;
  form_link: string;
  is_active: boolean;
  perfil_permitido: PerfilCpa;
};

/** Ano mínimo aceito no cadastro de uma CPA. */
export const ANO_MINIMO_CPA = 2003;

/**
 * Ano corrente no fuso do portal (America/Sao_Paulo). Usado como teto do cadastro de CPA
 * tanto no formulário quanto no servidor, para que ambos sempre concordem.
 */
export function anoAtualBrasil(): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    }).format(new Date()),
  );
}

export const ROTULOS_PERFIL_CPA: Record<PerfilCpa, string> = {
  aluno: "Aluno",
  professor: "Professor",
  coordenador: "Coordenador",
  avaliador_externo: "Avaliador Externo (MEC)",
  admin: "Administrador (CPA)",
};