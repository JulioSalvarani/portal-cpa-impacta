"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin, normalizarPerfil, type PerfilCpa } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export type EstadoCriarUsuario = {
  ok: boolean;
  mensagem: string;
} | null;

const PERFIS_PERMITIDOS = new Set<PerfilCpa>([
  "aluno",
  "coordenador",
  "avaliador_externo",
  "admin",
]);

export async function criarUsuarioAction(
  _prevState: EstadoCriarUsuario,
  formData: FormData,
): Promise<EstadoCriarUsuario> {
  await exigirAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const novoRole = normalizarPerfil(String(formData.get("role") ?? ""));

  if (!nome || !email || !email.includes("@")) {
    return {
      ok: false,
      mensagem: "Preencha um nome e um e-mail institucional válidos.",
    };
  }

  if (senha.length < 6) {
    return {
      ok: false,
      mensagem: "A senha inicial deve ter pelo menos 6 caracteres.",
    };
  }

  if (!PERFIS_PERMITIDOS.has(novoRole)) {
    return {
      ok: false,
      mensagem: "Selecione um perfil válido.",
    };
  }

  try {
    const listaRoles = await prisma.roles.findMany();
    const roleEncontrada = listaRoles.find(
      (r) => normalizarPerfil(r.role) === novoRole,
    );

    if (!roleEncontrada) {
      return {
        ok: false,
        mensagem: `Cargo "${novoRole}" não encontrado na tabela roles.`,
      };
    }

    const supabaseAdmin = createAdminClient();
    const { data: criado, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome,
          full_name: nome,
        },
      });

    if (authError || !criado.user) {
      return {
        ok: false,
        mensagem: authError?.message || "Falha ao criar conta no Supabase Auth.",
      };
    }

    await prisma.profiles.upsert({
      where: { user_id: criado.user.id },
      update: {
        email,
        nome,
        role: roleEncontrada.id,
      },
      create: {
        user_id: criado.user.id,
        email,
        nome,
        role: roleEncontrada.id,
      },
    });

    revalidatePath("/perfis");

    return {
      ok: true,
      mensagem: "Usuário criado e vinculado ao perfil com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      ok: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o usuário.",
    };
  }
}

export async function editarUsuarioAction(
  userId: string,
  novoNome: string,
  novoRole: PerfilCpa,
): Promise<{ ok: boolean; mensagem: string }> {
  const adminAtual = await exigirAdmin();
  const nomeLimpo = novoNome.trim();

  if (!userId || !nomeLimpo || !PERFIS_PERMITIDOS.has(novoRole)) {
    return {
      ok: false,
      mensagem: "Nome ou perfil inválido.",
    };
  }

  if (adminAtual.userId === userId && novoRole !== "admin") {
    return {
      ok: false,
      mensagem: "Você não pode remover seu próprio perfil de administrador.",
    };
  }

  try {
    const listaRoles = await prisma.roles.findMany();
    const roleEncontrada = listaRoles.find(
      (r) => normalizarPerfil(r.role) === novoRole,
    );

    if (!roleEncontrada) {
      return {
        ok: false,
        mensagem: `Cargo "${novoRole}" não encontrado na tabela roles.`,
      };
    }

    await prisma.profiles.update({
      where: { user_id: userId },
      data: {
        nome: nomeLimpo,
        role: roleEncontrada.id,
      },
    });

    revalidatePath("/perfis");

    return {
      ok: true,
      mensagem: "Usuário atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    return {
      ok: false,
      mensagem: "Não foi possível salvar as alterações no banco.",
    };
  }
}

export async function excluirUsuarioAction(
  userId: string,
): Promise<{ ok: boolean; mensagem: string }> {
  const adminAtual = await exigirAdmin();

  if (!userId) {
    return { ok: false, mensagem: "Usuário inválido." };
  }

  if (adminAtual.userId === userId) {
    return {
      ok: false,
      mensagem: "Você não pode excluir a sua própria conta de administrador.",
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    await prisma.profiles.deleteMany({
      where: { user_id: userId },
    });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Erro ao remover usuário do Auth:", error);
      return {
        ok: false,
        mensagem: `Perfil removido, mas falhou ao excluir no Auth: ${error.message}`,
      };
    }

    revalidatePath("/perfis");

    return {
      ok: true,
      mensagem: "Usuário excluído com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return {
      ok: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário.",
    };
  }
}