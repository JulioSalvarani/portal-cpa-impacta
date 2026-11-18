"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EstadoFormDevolutiva = {
  ok: boolean;
  mensagem: string;
} | null;

const PERFIS_VALIDOS = new Set([
  "aluno",
  "coordenador",
  "avaliador_externo",
  "admin",
]);

function extrairDadosDevolutiva(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const statusRaw = String(formData.get("statusId") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const perfisPermitidos = Array.from(
    new Set(
      formData
        .getAll("perfis")
        .map((valor) => String(valor).trim())
        .filter((valor) => PERFIS_VALIDOS.has(valor)),
    ),
  );

  return { titulo, area, statusRaw, motivo, perfisPermitidos };
}

export async function criarDevolutivaAction(
  _prevState: EstadoFormDevolutiva,
  formData: FormData,
): Promise<EstadoFormDevolutiva> {
  await exigirAdmin();

  const { titulo, area, statusRaw, motivo, perfisPermitidos } =
    extrairDadosDevolutiva(formData);

  if (!titulo || !area || !statusRaw || !motivo) {
    return {
      ok: false,
      mensagem: "Preencha todos os campos obrigatórios antes de enviar.",
    };
  }

  if (perfisPermitidos.length === 0) {
    return {
      ok: false,
      mensagem: "Selecione pelo menos um perfil para visualizar a devolutiva.",
    };
  }

  let statusId: bigint;
  try {
    statusId = BigInt(statusRaw);
  } catch {
    return {
      ok: false,
      mensagem: "Categoria selecionada inválida.",
    };
  }

  try {
    const [areaExiste, statusExiste] = await Promise.all([
      prisma.areas.findUnique({ where: { nome_area: area } }),
      prisma.status_respostas.findUnique({ where: { id: statusId } }),
    ]);

    if (!areaExiste) {
      return {
        ok: false,
        mensagem: "A área responsável selecionada não existe no cadastro.",
      };
    }

    if (!statusExiste) {
      return {
        ok: false,
        mensagem: "O status da resposta selecionado não existe no cadastro.",
      };
    }

    await prisma.respostas.create({
      data: {
        title: titulo,
        area,
        status: statusId,
        ano: new Date().getFullYear(),
        resposta: motivo,
        perfis_permitidos: perfisPermitidos,
      },
    });

    revalidatePath("/devolutivas");
    revalidatePath("/devolutivas/responder");

    return {
      ok: true,
      mensagem: "Devolutiva publicada com sucesso na Central de Devolutivas!",
    };
  } catch (error) {
    console.error("Erro ao cadastrar devolutiva:", error);
    return {
      ok: false,
      mensagem: "Não foi possível salvar a devolutiva no banco. Tente novamente.",
    };
  }
}

export async function editarDevolutivaAction(
  _prevState: EstadoFormDevolutiva,
  formData: FormData,
): Promise<EstadoFormDevolutiva> {
  await exigirAdmin();

  const idRaw = String(formData.get("id") ?? "").trim();
  const { titulo, area, statusRaw, motivo, perfisPermitidos } =
    extrairDadosDevolutiva(formData);

  if (!idRaw || !titulo || !area || !statusRaw || !motivo) {
    return {
      ok: false,
      mensagem: "Preencha todos os campos obrigatórios.",
    };
  }

  if (perfisPermitidos.length === 0) {
    return {
      ok: false,
      mensagem: "Selecione pelo menos um perfil.",
    };
  }

  let id: bigint;
  let statusId: bigint;
  try {
    id = BigInt(idRaw);
    statusId = BigInt(statusRaw);
  } catch {
    return {
      ok: false,
      mensagem: "Identificador ou categoria inválida.",
    };
  }

  try {
    const [areaExiste, statusExiste] = await Promise.all([
      prisma.areas.findUnique({ where: { nome_area: area } }),
      prisma.status_respostas.findUnique({ where: { id: statusId } }),
    ]);

    if (!areaExiste || !statusExiste) {
      return {
        ok: false,
        mensagem: "Área ou categoria selecionada não encontrada.",
      };
    }

    await prisma.respostas.update({
      where: { id },
      data: {
        title: titulo,
        area,
        status: statusId,
        resposta: motivo,
        perfis_permitidos: perfisPermitidos,
      },
    });

    revalidatePath("/devolutivas");

    return {
      ok: true,
      mensagem: "Devolutiva atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao editar devolutiva:", error);
    return {
      ok: false,
      mensagem: "Não foi possível atualizar a devolutiva.",
    };
  }
}

export async function excluirDevolutivaAction(
  idRaw: string,
): Promise<{ ok: boolean; mensagem: string }> {
  await exigirAdmin();

  let id: bigint;
  try {
    id = BigInt(idRaw);
  } catch {
    return {
      ok: false,
      mensagem: "Identificador inválido.",
    };
  }

  try {
    await prisma.respostas.delete({
      where: { id },
    });

    revalidatePath("/devolutivas");

    return {
      ok: true,
      mensagem: "Devolutiva excluída com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao excluir devolutiva:", error);
    return {
      ok: false,
      mensagem: "Não foi possível excluir a devolutiva.",
    };
  }
}