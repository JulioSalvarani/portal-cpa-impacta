import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type PerfilCpa = "aluno" | "coordenador" | "avaliador_externo" | "admin";

export type UsuarioLogado = {
  userId: string;
  email: string;
  nome: string;
  role: PerfilCpa;
};

const PERFIS_VALIDOS: ReadonlySet<string> = new Set([
  "aluno",
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

  return {
    userId: user.id,
    email,
    nome,
    role,
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
 * Guard exclusivo para rotas e Server Actions administrativas (`/devolutivas/responder`, `/perfis`).
 */
export async function exigirAdmin(): Promise<UsuarioLogado> {
  const usuario = await exigirUsuarioLogado();

  if (usuario.role !== "admin") {
    redirect("/inicio");
  }

  return usuario;
}