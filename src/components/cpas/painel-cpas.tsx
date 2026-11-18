"use client";

import { useActionState, useRef, useState } from "react";
import { ExternalLink, Power, Trash2 } from "lucide-react";
import {
  alternarStatusCpaAction,
  criarCpaAction,
  excluirCpaAction,
  type EstadoAcaoCpa,
} from "@/app/actions/cpas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { u } from "@/lib/cpa-box";
import { ROTULOS_PERFIL_CPA, type CpaItem } from "@/lib/cpas-data";
import { OPCOES_PERFIL } from "@/lib/perfis-data";

type Props = {
  cpasIniciais: CpaItem[];
};

export function PainelCpas({ cpasIniciais }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<number | null>(null);
  const [feedbackLista, setFeedbackLista] = useState<{ ok: boolean; texto: string } | null>(null);

  const [estadoForm, formAction, enviando] = useActionState<EstadoAcaoCpa, FormData>(
    async (prevState, formData) => {
      const res = await criarCpaAction(prevState, formData);
      if (res?.ok) {
        formRef.current?.reset();
      }
      return res;
    },
    null,
  );

  async function handleAlternarStatus(cpa: CpaItem) {
    setProcessandoId(cpa.id);
    setFeedbackLista(null);
    const res = await alternarStatusCpaAction(cpa.id, !cpa.is_active);
    setProcessandoId(null);
    setFeedbackLista({ ok: res.ok, texto: res.mensagem });
  }

  async function handleExcluir(cpaId: number) {
    if (confirmarExclusaoId !== cpaId) {
      setConfirmarExclusaoId(cpaId);
      return;
    }

    setProcessandoId(cpaId);
    setConfirmarExclusaoId(null);
    setFeedbackLista(null);
    const res = await excluirCpaAction(cpaId);
    setProcessandoId(null);
    setFeedbackLista({ ok: res.ok, texto: res.mensagem });
  }

  return (
    <div className="cpa-perfis-container">
      <form
        ref={formRef}
        action={formAction}
        className="cpa-cpas-upload"
        aria-label="Cadastrar nova pesquisa CPA"
      >
        <Input
          name="title"
          type="text"
          required
          placeholder="Título (ex.: Pesquisa CPA 2026/2)"
          className="cpa-field"
        />

        <Input
          name="form_link"
          type="url"
          required
          placeholder="Link do Google Forms (https://...)"
          className="cpa-field"
        />

        <select
          name="perfil"
          defaultValue="aluno"
          aria-label="Perfil permitido"
          className="cpa-field cpa-select"
        >
          {OPCOES_PERFIL.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.rotulo}
            </option>
          ))}
        </select>

        <Input
          name="ano"
          type="number"
          min={2000}
          max={2100}
          defaultValue={new Date().getFullYear()}
          required
          aria-label="Ano"
          className="cpa-field"
        />

        <select
          name="semestre"
          defaultValue="2"
          aria-label="Semestre"
          className="cpa-field cpa-select"
        >
          <option value="1">1º Sem</option>
          <option value="2">2º Sem</option>
        </select>

        <select
          name="is_active"
          defaultValue="true"
          aria-label="Status inicial"
          className="cpa-field cpa-select"
        >
          <option value="true">Ativa (única)</option>
          <option value="false">Encerrada</option>
        </select>

        <Button
          type="submit"
          disabled={enviando}
          className="cpa-btn cpa-btn--line"
          style={{ height: u(34), borderRadius: u(17), fontSize: u(13) }}
        >
          {enviando ? "Salvando..." : "Criar CPA"}
        </Button>
      </form>

      {(estadoForm || feedbackLista) && (
        <p
          role="status"
          style={{
            fontSize: u(13),
            marginTop: u(-4),
            color: (estadoForm?.ok ?? feedbackLista?.ok) ? "#0a6b0a" : "#b00000",
          }}
        >
          {estadoForm?.mensagem ?? feedbackLista?.texto}
        </p>
      )}

      <div className="cpa-perfis-head">
        <span>Pesquisas CPA cadastradas ({cpasIniciais.length})</span>
        <span>Regra ativa: apenas 1 CPA aberta simultaneamente</span>
      </div>

      <div className="cpa-perfis-list">
        {cpasIniciais.length === 0 ? (
          <div style={{ textAlign: "center", padding: `${u(28)} 0`, fontSize: u(15), color: "#444" }}>
            Nenhuma pesquisa CPA cadastrada no banco.
          </div>
        ) : (
          cpasIniciais.map((cpa) => {
            const ocupada = processandoId === cpa.id;
            const confirmando = confirmarExclusaoId === cpa.id;

            return (
              <div key={cpa.id} className="cpa-cpa-row">
                <div style={{ display: "flex", alignItems: "center", gap: u(10), minWidth: 0 }}>
                  <span
                    className={cpa.is_active ? "cpa-dot" : "cpa-dot cpa-dot--closed"}
                    style={{ width: u(12), height: u(12), flex: "none" }}
                    title={cpa.is_active ? "Ativa" : "Encerrada"}
                  />
                  <strong style={{ fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cpa.title}
                  </strong>
                </div>

                <span className="cpa-rel-badge">
                  {ROTULOS_PERFIL_CPA[cpa.perfil_permitido]}
                </span>

                <span style={{ color: "#333", fontSize: u(13) }}>
                  {cpa.ano}/{cpa.semestre}
                </span>

                <a
                  href={cpa.form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cpa.form_link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: u(4),
                    color: "#012a55",
                    fontSize: u(13),
                    textDecoration: "underline",
                  }}
                >
                  Forms
                  <ExternalLink aria-hidden style={{ width: u(13), height: u(13) }} />
                </a>

                <Button
                  type="button"
                  disabled={ocupada}
                  onClick={() => handleAlternarStatus(cpa)}
                  className="cpa-btn cpa-btn--line"
                  style={{ height: u(32), borderRadius: u(16), fontSize: u(12), gap: u(5) }}
                >
                  <Power aria-hidden style={{ width: u(13), height: u(13) }} />
                  {cpa.is_active ? "Encerrar" : "Ativar"}
                </Button>

                <Button
                  type="button"
                  disabled={ocupada}
                  onClick={() => handleExcluir(cpa.id)}
                  className="cpa-btn cpa-btn--ghost"
                  style={{
                    height: u(32),
                    borderRadius: u(16),
                    fontSize: u(12),
                    color: "#b00000",
                    gap: u(4),
                  }}
                  title="Excluir CPA"
                >
                  <Trash2 aria-hidden style={{ width: u(14), height: u(14) }} />
                  {confirmando ? "Confirmar?" : "Excluir"}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}