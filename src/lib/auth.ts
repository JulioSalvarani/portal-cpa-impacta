import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type UsuarioSessao = {
  userId: string;
  email: string;
  nome: string;
  roleId: number;
  role: string; // "user" | "admin"
};

export async function getUsuarioLogado(): Promise<UsuarioSessao | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profiles.findUnique({
    where: { user_id: user.id },
  });

  if (!profile) return null;

  const roleRecord = await prisma.roles.findUnique({
    where: { id: profile.role },
  });

  return {
    userId: profile.user_id,
    email: profile.email,
    nome: profile.nome ?? profile.email,
    roleId: Number(profile.role),
    role: roleRecord?.role ?? "user",
  };
}

export async function exigirUsuarioLogado(): Promise<UsuarioSessao> {
  const usuario = await getUsuarioLogado();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

export async function exigirAdmin(): Promise<UsuarioSessao> {
  const usuario = await exigirUsuarioLogado();
  console.log("[DEBUG ADMIN]", usuario);
  if (usuario.role !== "admin") {
    redirect("/inicio");
  }
  return usuario;
}