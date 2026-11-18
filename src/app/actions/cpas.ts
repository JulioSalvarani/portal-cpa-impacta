"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin, normalizarPerfil, type PerfilCpa } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EstadoAcaoCpa = {
  ok: boolean;
  mensagem: string;
} | null;

const PERFIS_VALIDOS = new Set<PerfilCpa>([
  "aluno",
  "coordenador",
  "avaliador_externo",
  "admin",
]);

export async function criarCpaAction(
  _prevState: EstadoAcaoCpa,
  formData: FormData,
): Promise<EstadoAcaoCpa> {
  await exigirAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const formLink = String(formData.get("form_link") ?? "").trim();
  const ano = Number(formData.get("ano"));
  const semestre = Number(formData.get("semestre"));
  const perfilRaw = normalizarPerfil(String(formData.get("perfil") ?? ""));
  const isActive = formData.get("is_active") === "true";

  if (!title || !formLink) {
    return {
      ok: false,
      mensagem: "Preencha o título da CPA e o link do formulário.",
    };
  }

  try {
    new URL(formLink);
  } catch {
    return {
      ok: false,
      mensagem: "Informe uma URL válida para o formulário (ex.: https://docs.google.com/forms/...).",
    };
  }

  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    return {
      ok: false,
      mensagem: "Informe um ano válido entre 2000 e 2100.",
    };
  }

  if (semestre !== 1 && semestre !== 2) {
    return {
      ok: false,
      mensagem: "O semestre deve ser 1 ou 2.",
    };
  }

  if (!PERFIS_VALIDOS.has(perfilRaw)) {
    return {
      ok: false,
      mensagem: "Selecione um perfil permitido válido.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.cpas.updateMany({
          where: { is_active: true },
          data: { is_active: false },
        });
      }

      await tx.cpas.create({
        data: {
          title,
          form_link: formLink,
          ano,
          semestre,
          is_active: isActive,
          perfis_permitidos: [perfilRaw],
        },
      });
    });

    revalidatePath("/cpas");
    revalidatePath("/inicio");

    return {
      ok: true,
      mensagem: isActive
        ? "CPA criada e definida como única pesquisa ativa."
        : "CPA cadastrada como encerrada.",
    };
  } catch (error: unknown) {
    const codigoPrisma =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    if (codigoPrisma === "P2002") {
      return {
        ok: false,
        mensagem: "Já existe uma CPA cadastrada com este mesmo link de formulário.",
      };
    }

    console.error("Erro ao criar CPA:", error);
    return {
      ok: false,
      mensagem: "Não foi possível salvar a CPA no banco.",
    };
  }
}

export async function alternarStatusCpaAction(
  cpaId: number,
  ativar: boolean,
): Promise<{ ok: boolean; mensagem: string }> {
  await exigirAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      if (ativar) {
        await tx.cpas.updateMany({
          where: { is_active: true },
          data: { is_active: false },
        });
      }

      await tx.cpas.update({
        where: { id: BigInt(cpaId) },
        data: { is_active: ativar },
      });
    });

    revalidatePath("/cpas");
    revalidatePath("/inicio");

    return {
      ok: true,
      mensagem: ativar
        ? "CPA ativada (as demais foram encerradas)."
        : "CPA encerrada.",
    };
  } catch (error) {
    console.error("Erro ao alterar status da CPA:", error);
    return {
      ok: false,
      mensagem: "Não foi possível atualizar o status da CPA.",
    };
  }
}

export async function excluirCpaAction(
  cpaId: number,
): Promise<{ ok: boolean; mensagem: string }> {
  await exigirAdmin();

  try {
    await prisma.cpas.delete({
      where: { id: BigInt(cpaId) },
    });

    revalidatePath("/cpas");
    revalidatePath("/inicio");

    return {
      ok: true,
      mensagem: "CPA removida com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao excluir CPA:", error);
    return {
      ok: false,
      mensagem: "Não foi possível excluir a CPA.",
    };
  }
}