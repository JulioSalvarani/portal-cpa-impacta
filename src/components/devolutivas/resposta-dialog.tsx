"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "@/app/cpa-resposta.css";
import {
  editarDevolutivaAction,
  excluirDevolutivaAction,
  type DestinoDevolutiva,
  type EstadoFormDevolutiva,
} from "@/app/actions/devolutivas";
import { EtiquetaCategoria } from "@/components/devolutivas/etiqueta-categoria";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PerfilCpa } from "@/lib/auth";
import { box, u } from "@/lib/cpa-box";
import {
  categoriaPorId,
  type Devolutiva,
  type OpcaoStatusFormulario,
} from "@/lib/devolutivas-data";

type Props = {
  devolutiva: Devolutiva;
  isAdmin?: boolean;
  areas?: string[];
  categorias?: OpcaoStatusFormulario[];
};

const DESTINOS_OPCOES: { valor: DestinoDevolutiva; rotulo: string }[] = [
  { valor: "alunos", rotulo: "Devolutiva para Alunos" },
  { valor: "corpo_funcional", rotulo: "Devolutiva para Corpo funcional" },
];

export function RespostaDialog({
  devolutiva,
  isAdmin = false,
  areas = [],
  categorias = [],
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const [estadoEdicao, formAction, salvando] = useActionState<
    EstadoFormDevolutiva,
    FormData
  >(async (prevState, formData) => {
    const res = await editarDevolutivaAction(prevState, formData);
    if (res?.ok) {
      setModoEdicao(false);
    }
    return res;
  }, null);

  function handleOpenChange(novoEstado: boolean) {
    setAberto(novoEstado);
    if (!novoEstado) {
      setModoEdicao(false);
      setConfirmandoExclusao(false);
      setErroExclusao(null);
    }
  }

  async function handleConfirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    const res = await excluirDevolutivaAction(devolutiva.id);
    setExcluindo(false);

    if (res.ok) {
      setAberto(false);
    } else {
      setErroExclusao(res.mensagem);
    }
  }

  const categoria = categoriaPorId(devolutiva.categoria);
  const perfisAtuais = new Set<PerfilCpa>(
    devolutiva.perfisPermitidos ?? [
      "aluno",
      "coordenador",
      "avaliador_externo",
      "admin",
    ],
  );
  const destinoAtual: DestinoDevolutiva = perfisAtuais.has("aluno")
    ? "alunos"
    : "corpo_funcional";

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="cpa-m-ver"
          style={{ height: u(22), lineHeight: u(20), fontSize: u(16) }}
        >
          Ver resposta
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`cpa-modal cpa-modal--resposta ${
          modoEdicao ? "cpa-modal--edicao" : isAdmin ? "cpa-modal--admin" : ""
        } translate-x-0 translate-y-0`}
      >
        <DialogTitle
          className="cpa-m-title"
          style={box(42, 14, 476, 44, { fontSize: u(18) })}
        >
          {modoEdicao ? "Editar Devolutiva" : "Resposta da Devolutiva"}
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Justificativa dada por {devolutiva.area} a esta devolutiva.
        </DialogDescription>

        {modoEdicao ? (
          <form
            action={formAction}
            className="cpa-m-item"
            style={box(42, 72, 476, 344)}
          >
            <input type="hidden" name="id" value={devolutiva.id} />

            <span className="cpa-m-label" style={{ left: u(18), top: u(8) }}>
              Título
            </span>
            <input
              type="text"
              name="titulo"
              required
              defaultValue={devolutiva.titulo}
              className="cpa-field"
              style={box(16, 25, 444, 30, { fontSize: u(14) })}
            />

            <span className="cpa-m-label" style={{ left: u(18), top: u(61) }}>
              Área responsável
            </span>
            <select
              name="area"
              required
              defaultValue={devolutiva.area}
              className="cpa-field cpa-select"
              style={box(16, 78, 216, 30, { fontSize: u(14) })}
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <span className="cpa-m-label" style={{ left: u(246), top: u(61) }}>
              Categoria
            </span>
            <select
              name="statusId"
              required
              defaultValue={devolutiva.statusId ?? categorias[0]?.id ?? ""}
              className="cpa-field cpa-select"
              style={box(244, 78, 216, 30, { fontSize: u(14) })}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.rotulo}
                </option>
              ))}
            </select>

            <span className="cpa-m-label" style={{ left: u(18), top: u(114) }}>
              Destinatário da devolutiva
            </span>
            <div
              role="radiogroup"
              aria-label="Destinatário da devolutiva"
              style={box(16, 131, 444, 24, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff",
                fontSize: u(13),
              })}
            >
              {DESTINOS_OPCOES.map((d) => (
                <label
                  key={d.valor}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: u(5),
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="destino"
                    value={d.valor}
                    defaultChecked={destinoAtual === d.valor}
                    style={{ width: u(14), height: u(14) }}
                  />
                  <span>{d.rotulo}</span>
                </label>
              ))}
            </div>

            <span className="cpa-m-label" style={{ left: u(18), top: u(160) }}>
              Justificativa
            </span>
            <textarea
              name="motivo"
              required
              defaultValue={devolutiva.justificativa}
              className="cpa-textarea"
              style={box(16, 177, 444, 96, { fontSize: u(14) })}
            />

            {estadoEdicao && !estadoEdicao.ok && (
              <p
                role="status"
                style={box(16, 276, 444, 16, {
                  color: "#ffd6d6",
                  fontSize: u(12),
                  textAlign: "center",
                })}
              >
                {estadoEdicao.mensagem}
              </p>
            )}

            <div
              style={box(16, 298, 444, 32, {
                display: "flex",
                justifyContent: "flex-end",
                gap: u(10),
              })}
            >
              <Button
                type="button"
                onClick={() => setModoEdicao(false)}
                className="cpa-m-ver"
                style={{ height: u(30), fontSize: u(14), padding: `0 ${u(14)}` }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando}
                className="cpa-m-ver"
                style={{
                  height: u(30),
                  fontSize: u(14),
                  padding: `0 ${u(16)}`,
                  background: "#0ee80e",
                  color: "#000000",
                }}
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        ) : (
          <div
            className="cpa-m-item"
            style={box(42, 72, 476, isAdmin ? 282 : 232)}
          >
            <span className="cpa-m-label" style={{ left: u(18), top: u(9) }}>
              Título
            </span>
            <div className="cpa-m-text cpa-m-text--short" style={box(16, 26, 444, 30)}>
              {devolutiva.titulo}
            </div>

            <span className="cpa-m-label" style={{ left: u(18), top: u(65) }}>
              Área responsável
            </span>
            <div className="cpa-m-text cpa-m-text--short" style={box(16, 82, 280, 30)}>
              {devolutiva.area}
            </div>
            <EtiquetaCategoria
              categoria={categoria}
              style={{ right: u(16), top: u(86) }}
            />

            <span className="cpa-m-label" style={{ left: u(18), top: u(122) }}>
              Justificativa
            </span>
            <div className="cpa-m-text cpa-m-text--scroll" style={box(16, 139, 444, 80)}>
              {devolutiva.justificativa}
            </div>

            {isAdmin && (
              <div
                style={box(16, 234, 444, 32, {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: u(10),
                })}
              >
                {erroExclusao ? (
                  <span style={{ color: "#ffd6d6", fontSize: u(12) }}>
                    {erroExclusao}
                  </span>
                ) : (
                  <span />
                )}

                {confirmandoExclusao ? (
                  <div style={{ display: "flex", alignItems: "center", gap: u(8) }}>
                    <span style={{ color: "#ffffff", fontSize: u(13) }}>
                      Excluir definitivamente?
                    </span>
                    <Button
                      type="button"
                      disabled={excluindo}
                      onClick={() => setConfirmandoExclusao(false)}
                      className="cpa-m-ver"
                      style={{ height: u(28), fontSize: u(13), padding: `0 ${u(12)}` }}
                    >
                      Não
                    </Button>
                    <Button
                      type="button"
                      disabled={excluindo}
                      onClick={handleConfirmarExclusao}
                      className="cpa-m-ver"
                      style={{
                        height: u(28),
                        fontSize: u(13),
                        padding: `0 ${u(12)}`,
                        background: "#f20000",
                        color: "#ffffff",
                      }}
                    >
                      {excluindo ? "Excluindo..." : "Sim, excluir"}
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: u(10) }}>
                    <Button
                      type="button"
                      onClick={() => setModoEdicao(true)}
                      className="cpa-m-ver"
                      style={{
                        height: u(28),
                        fontSize: u(14),
                        padding: `0 ${u(14)}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: u(6),
                      }}
                    >
                      <Pencil aria-hidden style={{ width: u(14), height: u(14) }} />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setConfirmandoExclusao(true)}
                      className="cpa-m-ver"
                      style={{
                        height: u(28),
                        fontSize: u(14),
                        padding: `0 ${u(14)}`,
                        background: "#f20000",
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: u(6),
                      }}
                    >
                      <Trash2 aria-hidden style={{ width: u(14), height: u(14) }} />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}