"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin, normalizarPerfil, type PerfilCpa } from "@/lib/auth";
import { ANO_MINIMO_CPA, anoAtualBrasil } from "@/lib/cpas-data";
import { prisma } from "@/lib/prisma";

export type EstadoAcaoCpa = {
  ok: boolean;
  mensagem: string;
} | null;

const PERFIS_VALIDOS = new Set<PerfilCpa>([
  "aluno",
  "professor",
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

  const anoAtual = anoAtualBrasil();

  if (!Number.isInteger(ano) || ano < ANO_MINIMO_CPA || ano > anoAtual) {
    return {
      ok: false,
      mensagem: `O ano da CPA deve estar entre ${ANO_MINIMO_CPA} e ${anoAtual}.`,
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
          where: {
            is_active: true,
            perfis_permitidos: { hasSome: [perfilRaw] },
          },
          data: { is_active: false },
        });
      }

      await tx.cpas.create({
        data: {
          title,
          form_link: formLink,
          ano,
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
        ? "CPA criada e definida como a pesquisa ativa deste perfil."
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
    const encontrada = await prisma.$transaction(async (tx) => {
      const alvo = await tx.cpas.findUnique({
        where: { id: BigInt(cpaId) },
        select: { id: true, perfis_permitidos: true },
      });

      if (!alvo) return false;

      if (ativar) {
        await tx.cpas.updateMany({
          where: {
            is_active: true,
            id: { not: alvo.id },
            perfis_permitidos: { hasSome: alvo.perfis_permitidos },
          },
          data: { is_active: false },
        });
      }

      await tx.cpas.update({
        where: { id: alvo.id },
        data: { is_active: ativar },
      });

      return true;
    });

    if (!encontrada) {
      return { ok: false, mensagem: "CPA não encontrada." };
    }

    revalidatePath("/cpas");
    revalidatePath("/inicio");

    return {
      ok: true,
      mensagem: ativar
        ? "CPA ativada (as demais do mesmo perfil foram encerradas)."
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