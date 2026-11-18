"use client";

import { useActionState, useRef, useState } from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
import {
  excluirRelatorioAction,
  publicarRelatorioAction,
  type EstadoUploadRelatorio,
} from "@/app/actions/relatorios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { u } from "@/lib/cpa-box";
import type { RelatorioDocumento, TipoRelatorio } from "@/lib/relatorios-data";

type Props = {
  documentosIniciais?: RelatorioDocumento[];
  isAdmin?: boolean;
};

export function PainelRelatorios({
  documentosIniciais = [],
  isAdmin = false,
}: Props) {
  const [filtro, setFiltro] = useState<"Todos" | TipoRelatorio>("Todos");
  const [nomeArquivo, setNomeArquivo] = useState<string>("Selecionar PDF");
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<number | null>(null);
  const [feedbackLista, setFeedbackLista] = useState<{ ok: boolean; texto: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [estadoUpload, formAction, enviando] = useActionState<
    EstadoUploadRelatorio,
    FormData
  >(async (prevState, formData) => {
    setFeedbackLista(null);
    const res = await publicarRelatorioAction(prevState, formData);
    if (res?.ok) {
      formRef.current?.reset();
      setNomeArquivo("Selecionar PDF");
    }
    return res;
  }, null);

  async function handleExcluir(docId: number) {
    if (confirmarExclusaoId !== docId) {
      setConfirmarExclusaoId(docId);
      return;
    }

    setExcluindoId(docId);
    setConfirmarExclusaoId(null);
    setFeedbackLista(null);

    const res = await excluirRelatorioAction(docId);

    setExcluindoId(null);
    setFeedbackLista({ ok: res.ok, texto: res.mensagem });
  }

  const filtrados =
    filtro === "Todos"
      ? documentosIniciais
      : documentosIniciais.filter((doc) => doc.tipo === filtro);

  return (
    <div className="cpa-rel-container">
      {isAdmin && (
        <>
          <form
            ref={formRef}
            action={formAction}
            className="cpa-rel-upload"
            aria-label="Publicar novo relatório"
          >
            <Input
              name="titulo"
              type="text"
              required
              placeholder="Título do relatório ou boletim"
              className="cpa-field"
            />

            <select
              name="tipo"
              defaultValue="Relatório de Autoavaliação"
              className="cpa-field cpa-select"
            >
              <option value="Relatório de Autoavaliação">
                Relatório de Autoavaliação
              </option>
              <option value="Boletim Informativo">Boletim Informativo</option>
            </select>

            <Input
              name="ano"
              type="number"
              min={2000}
              max={2100}
              defaultValue={new Date().getFullYear()}
              required
              className="cpa-field"
            />

            <label className="cpa-rel-file-label">
              <FileUp aria-hidden style={{ width: u(15), height: u(15), flex: "none" }} />
              <span>{nomeArquivo}</span>
              <input
                type="file"
                name="arquivo"
                accept="application/pdf"
                required
                className="cpa-sr"
                onChange={(e) =>
                  setNomeArquivo(e.target.files?.[0]?.name || "Selecionar PDF")
                }
              />
            </label>

            <Button
              type="submit"
              disabled={enviando}
              className="cpa-btn cpa-btn--line"
              style={{ height: u(34), borderRadius: u(17), fontSize: u(13) }}
            >
              {enviando ? "Enviando..." : "Publicar PDF"}
            </Button>
          </form>

          {(estadoUpload || feedbackLista) && (
            <p
              role="status"
              style={{
                fontSize: u(13),
                marginTop: u(-6),
                color: (estadoUpload?.ok ?? feedbackLista?.ok) ? "#0a6b0a" : "#b00000",
              }}
            >
              {estadoUpload?.mensagem ?? feedbackLista?.texto}
            </p>
          )}
        </>
      )}

      <div className="cpa-rel-tabs" role="tablist" aria-label="Filtrar documentos">
        {(["Todos", "Relatório de Autoavaliação", "Boletim Informativo"] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filtro === tab}
              onClick={() => setFiltro(tab)}
              className={`cpa-tab ${filtro === tab ? "cpa-tab--active" : ""}`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      <div className="cpa-rel-list">
        {filtrados.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: `${u(32)} 0`,
              fontSize: u(16),
              color: "#444",
            }}
          >
            Nenhum documento publicado nesta categoria.
          </div>
        ) : (
          filtrados.map((doc) => {
            const ocupada = excluindoId === doc.id;
            const confirmando = confirmarExclusaoId === doc.id;

            return (
              <article key={doc.id} className="cpa-rel-card">
                <div className="cpa-rel-meta">
                  <div className="cpa-rel-badges">
                    <span className="cpa-rel-badge">{doc.tipo}</span>
                    <span className="cpa-rel-year">{doc.ano}</span>
                  </div>
                  <h2 className="cpa-rel-title">{doc.titulo}</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: u(8), flex: "none" }}>
                  <Button
                    asChild
                    className="cpa-btn cpa-btn--line"
                    style={{
                      height: u(38),
                      padding: `0 ${u(16)}`,
                      borderRadius: u(19),
                      fontSize: u(14),
                      gap: u(8),
                    }}
                  >
                    <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                      <Download aria-hidden style={{ width: u(16), height: u(16) }} />
                      Baixar PDF
                    </a>
                  </Button>

                  {isAdmin && (
                    <Button
                      type="button"
                      disabled={ocupada}
                      onClick={() => handleExcluir(doc.id)}
                      className="cpa-btn cpa-btn--ghost"
                      style={{
                        height: u(38),
                        padding: `0 ${u(12)}`,
                        borderRadius: u(19),
                        fontSize: u(13),
                        color: "#b00000",
                        gap: u(5),
                      }}
                      title="Excluir relatório"
                    >
                      <Trash2 aria-hidden style={{ width: u(15), height: u(15) }} />
                      {confirmando ? "Confirmar?" : "Excluir"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}