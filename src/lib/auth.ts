import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type PerfilCpa =
  | "aluno"
  | "professor"
  | "coordenador"
  | "avaliador_externo"
  | "admin";

export type UsuarioLogado = {
  userId: string;
  email: string;
  nome: string;
  role: PerfilCpa;
  corHex: string | null;
};

export const PERFIS_VISAO_GLOBAL_DEVOLUTIVAS: readonly PerfilCpa[] = [
  "admin",
  "coordenador",
  "avaliador_externo",
];

export const PERFIS_GESTORES_RELATORIOS: readonly PerfilCpa[] = [
  "admin",
  "coordenador",
];

export function temVisaoGlobalDevolutivas(role: PerfilCpa): boolean {
  return PERFIS_VISAO_GLOBAL_DEVOLUTIVAS.includes(role);
}

export function podeGerenciarRelatorios(role: PerfilCpa): boolean {
  return PERFIS_GESTORES_RELATORIOS.includes(role);
}

const PERFIS_VALIDOS: ReadonlySet<string> = new Set([
  "aluno",
  "professor",
  "coordenador",
  "avaliador_externo",
  "admin",
]);

/**
 * Normaliza a string da tabela `roles` para o tipo oficial `PerfilCpa`,
 * mantendo fallback compatível caso existam registros legados (`user` -> `aluno`).
 */
export function normalizarPerfil(roleBruta?: string | null): PerfilCpa {
  const valor = (roleBruta ?? "").trim().toLowerCase();

  if (valor === "user" || valor === "") {
    return "aluno";
  }

  if (PERFIS_VALIDOS.has(valor)) {
    return valor as PerfilCpa;
  }

  return "aluno";
}

/**
 * Lê o usuário autenticado no Supabase Auth e busca seu perfil + cargo via Prisma.
 */
export async function getUsuarioLogado(): Promise<UsuarioLogado | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const perfil = await prisma.profiles.findUnique({
    where: { user_id: user.id },
    include: { roles: true },
  });

  const email = perfil?.email ?? user.email ?? "";
  const nomeFallback = email.includes("@") ? email.split("@")[0] : "Usuário";
  const nome = (perfil?.nome ?? "").trim() || nomeFallback;
  const role = normalizarPerfil(perfil?.roles?.role);
  const corHex = perfil?.roles?.cor_hex?.trim() || null;

  return {
    userId: user.id,
    email,
    nome,
    role,
    corHex,
  };
}

/**
 * Guard para páginas internas autenticadas (`/inicio`, `/devolutivas`, `/resultados`, `/relatorios`).
 */
export async function exigirUsuarioLogado(): Promise<UsuarioLogado> {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect("/login");
  }

  return usuario;
}

/**
 * Guard das Server Actions de relatórios (`publicarRelatorioAction` e `excluirRelatorioAction`):
 * aceita `admin` e `coordenador`.
 */
export async function exigirGestorRelatorios(): Promise<UsuarioLogado> {
  const usuario = await exigirUsuarioLogado();

  if (!podeGerenciarRelatorios(usuario.role)) {
    redirect("/inicio");
  }

  return usuario;
}

/**
 * Guard exclusivo para rotas e Server Actions administrativas (`/cpas`, `/devolutivas/responder`, `/perfis`).
 */
export async function exigirAdmin(): Promise<UsuarioLogado> {
  const usuario = await exigirUsuarioLogado();

  if (usuario.role !== "admin") {
    redirect("/inicio");
  }

  return usuario;
}