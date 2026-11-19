"use server";

import { revalidatePath } from "next/cache";
import { exigirGestorRelatorios } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TipoRelatorio } from "@/lib/relatorios-data";
import { createClient } from "@/lib/supabase/server";

export type EstadoUploadRelatorio = {
  ok: boolean;
  mensagem: string;
} | null;

const BUCKET_RELATORIOS = "relatorios-cpa";
const MARCADOR_PUBLIC_URL = `/storage/v1/object/public/${BUCKET_RELATORIOS}/`;

const TIPOS_VALIDOS = new Set<TipoRelatorio>([
  "Relatório de Autoavaliação",
  "Boletim Informativo",
]);

function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function extrairCaminhoStorage(arquivoUrl: string): string | null {
  const idx = arquivoUrl.indexOf(MARCADOR_PUBLIC_URL);
  if (idx === -1) return null;

  const caminhoBruto = arquivoUrl.slice(idx + MARCADOR_PUBLIC_URL.length).split("?")[0];
  return caminhoBruto ? decodeURIComponent(caminhoBruto) : null;
}

export async function publicarRelatorioAction(
  _prevState: EstadoUploadRelatorio,
  formData: FormData,
): Promise<EstadoUploadRelatorio> {
  await exigirGestorRelatorios();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipoRaw = String(formData.get("tipo") ?? "").trim() as TipoRelatorio;
  const ano = Number(formData.get("ano"));
  const arquivo = formData.get("arquivo");

  if (!titulo || !TIPOS_VALIDOS.has(tipoRaw) || !Number.isFinite(ano)) {
    return {
      ok: false,
      mensagem: "Preencha título, tipo e ano corretamente.",
    };
  }

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return {
      ok: false,
      mensagem: "Selecione um arquivo PDF antes de publicar.",
    };
  }

  const ehPdf =
    arquivo.type === "application/pdf" ||
    arquivo.name.toLowerCase().endsWith(".pdf");

  if (!ehPdf) {
    return {
      ok: false,
      mensagem: "Apenas arquivos no formato PDF são permitidos.",
    };
  }

  try {
    const supabase = await createClient();
    const caminhoStorage = `${ano}/${Date.now()}-${sanitizarNomeArquivo(arquivo.name)}`;
    const buffer = Buffer.from(await arquivo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_RELATORIOS)
      .upload(caminhoStorage, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload Storage:", uploadError);
      return {
        ok: false,
        mensagem: `Falha ao enviar PDF para o Storage: ${uploadError.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_RELATORIOS).getPublicUrl(caminhoStorage);

    await prisma.relatorios.create({
      data: {
        titulo,
        tipo: tipoRaw,
        ano,
        arquivo_url: publicUrl,
      },
    });

    revalidatePath("/relatorios");

    return {
      ok: true,
      mensagem: "Documento publicado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao salvar relatório:", error);
    return {
      ok: false,
      mensagem: "Não foi possível salvar o documento no banco.",
    };
  }
}

export async function excluirRelatorioAction(
  idRaw: number | string,
): Promise<{ ok: boolean; mensagem: string }> {
  await exigirGestorRelatorios();

  let id: bigint;
  try {
    id = BigInt(idRaw);
  } catch {
    return {
      ok: false,
      mensagem: "Identificador do relatório inválido.",
    };
  }

  try {
    const relatorio = await prisma.relatorios.findUnique({
      where: { id },
    });

    if (!relatorio) {
      return {
        ok: false,
        mensagem: "Relatório não encontrado.",
      };
    }

    const caminhoStorage = extrairCaminhoStorage(relatorio.arquivo_url);
    if (caminhoStorage) {
      const supabase = await createClient();
      const { error: storageError } = await supabase.storage
        .from(BUCKET_RELATORIOS)
        .remove([caminhoStorage]);

      if (storageError) {
        console.warn("Aviso ao remover PDF do Storage:", storageError.message);
      }
    }

    await prisma.relatorios.delete({
      where: { id },
    });

    revalidatePath("/relatorios");

    return {
      ok: true,
      mensagem: "Relatório excluído com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao excluir relatório:", error);
    return {
      ok: false,
      mensagem: "Não foi possível excluir o relatório.",
    };
  }
}