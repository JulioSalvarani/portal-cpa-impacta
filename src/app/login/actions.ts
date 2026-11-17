"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  erro?: string;
} | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data.user) {
    return { erro: "E-mail ou senha inválidos." };
  }

  const profile = await prisma.profiles.findUnique({
    where: { user_id: data.user.id },
  });

  if (!profile) {
    await supabase.auth.signOut();
    return { erro: "Usuário sem perfil cadastrado no sistema." };
  }

  redirect("/inicio");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}