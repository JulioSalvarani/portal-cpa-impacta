"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  criarDevolutivaAction,
  type DestinoDevolutiva,
  type EstadoFormDevolutiva,
} from "@/app/actions/devolutivas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { box, u } from "@/lib/cpa-box";
import type { OpcaoStatusFormulario } from "@/lib/devolutivas-data";

type Props = {
  areas: string[];
  categorias: OpcaoStatusFormulario[];
};

const DESTINOS_OPCOES: { valor: DestinoDevolutiva; rotulo: string }[] = [
  { valor: "alunos", rotulo: "Devolutiva para Alunos" },
  { valor: "corpo_funcional", rotulo: "Devolutiva para Corpo funcional" },
];

export function FormResposta({ areas, categorias }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [estado, formAction, isPending] = useActionState<EstadoFormDevolutiva, FormData>(
    criarDevolutivaAction,
    null,
  );

  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
    }
  }, [estado]);

  return (
    <form ref={formRef} action={formAction} style={{ display: "contents" }}>
      <Label
        htmlFor="titulo"
        className="cpa-flabel"
        style={box(24, 12, 592, 20, { fontSize: u(15) })}
      >
        Título da resposta
      </Label>
      <Input
        id="titulo"
        name="titulo"
        type="text"
        required
        placeholder="Escreva o título da devolutiva"
        autoComplete="off"
        className="cpa-field"
        style={box(24, 34, 592, 32, { fontSize: u(15) })}
      />

      <Label
        htmlFor="area"
        className="cpa-flabel"
        style={box(24, 74, 290, 20, { fontSize: u(15) })}
      >
        Área responsável
      </Label>
      <select
        id="area"
        name="area"
        defaultValue=""
        required
        className="cpa-field cpa-select"
        style={box(24, 96, 290, 32, { fontSize: u(15) })}
      >
        <option value="" disabled>
          Selecione a área
        </option>
        {areas.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <Label
        htmlFor="statusId"
        className="cpa-flabel"
        style={box(326, 74, 290, 20, { fontSize: u(15) })}
      >
        Categoria da resposta
      </Label>
      <select
        id="statusId"
        name="statusId"
        defaultValue={categorias[0]?.id ?? ""}
        required
        className="cpa-field cpa-select"
        style={box(326, 96, 290, 32, { fontSize: u(15) })}
      >
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.rotulo}
          </option>
        ))}
      </select>

      <span
        className="cpa-flabel"
        style={box(24, 136, 592, 20, { fontSize: u(15) })}
      >
        Destinatário (Coordenação, Avaliador Externo e Admin visualizam todas)
      </span>
      <div
        role="radiogroup"
        aria-label="Destinatário da devolutiva"
        style={box(24, 158, 592, 28, {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: u(36),
          fontSize: u(14),
        })}
      >
        {DESTINOS_OPCOES.map((destino) => (
          <label
            key={destino.valor}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: u(6),
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="destino"
              value={destino.valor}
              defaultChecked={destino.valor === "alunos"}
              style={{ width: u(15), height: u(15), accentColor: "var(--cpa-navy)" }}
            />
            <span>{destino.rotulo}</span>
          </label>
        ))}
      </div>

      <Label
        htmlFor="motivo"
        className="cpa-flabel"
        style={box(24, 194, 592, 20, { fontSize: u(15) })}
      >
        Motivo da resposta
      </Label>
      <textarea
        id="motivo"
        name="motivo"
        required
        placeholder="Descreva a justificativa oficial da instituição"
        className="cpa-textarea"
        style={box(24, 216, 592, 92, { fontSize: u(15) })}
      />

      {estado && (
        <p
          role="status"
          className="cpa-form-feedback"
          style={box(24, 314, 592, 18, {
            color: estado.ok ? "#0a6b0a" : "#c00000",
          })}
        >
          {estado.mensagem}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="cpa-btn cpa-btn--line"
        style={box(220, 338, 200, 42, { borderRadius: u(21), fontSize: u(16) })}
      >
        {isPending ? "Enviando..." : "Enviar resposta"}
      </Button>
    </form>
  );
}