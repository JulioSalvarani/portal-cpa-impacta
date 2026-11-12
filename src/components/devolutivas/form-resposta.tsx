import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { box, u } from "@/lib/cpa-box";

/** Áreas de exemplo para o campo "Área responsável". */
const AREAS = [
  "Secretaria Acadêmica",
  "Coordenação de Curso",
  "Infraestrutura e Manutenção",
  "Biblioteca",
  "Financeiro",
  "Tecnologia da Informação",
  "Direção",
];

/** Categorias da resposta. */
const CATEGORIAS = ["Resolvido", "Inapto", "Impertinente"];

/**
 * PROTÓTIPO VISUAL: campos sem envio nem validação.
 * As coordenadas são relativas ao cartão cinza (640 × 360 no mockup).
 * TODO (implementação): envolver em <form>, ligar ao envio e trocar o botão por type="submit".
 */
export function FormResposta() {
  return (
    <>
      <Label htmlFor="area" className="cpa-flabel" style={box(24, 20, 290, 22, { fontSize: u(15) })}>
        Área responsável
      </Label>
      <select
        id="area"
        name="area"
        defaultValue=""
        className="cpa-field cpa-select"
        style={box(24, 44, 290, 34, { fontSize: u(16) })}
      >
        <option value="" disabled>
          Selecione a área
        </option>
        {AREAS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <Label htmlFor="categoria" className="cpa-flabel" style={box(326, 20, 290, 22, { fontSize: u(15) })}>
        Categoria da resposta
      </Label>
      <select
        id="categoria"
        name="categoria"
        defaultValue=""
        className="cpa-field cpa-select"
        style={box(326, 44, 290, 34, { fontSize: u(16) })}
      >
        <option value="" disabled>
          Selecione a categoria
        </option>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c.toLowerCase()}>
            {c}
          </option>
        ))}
      </select>

      <Label htmlFor="motivo" className="cpa-flabel" style={box(24, 98, 592, 22, { fontSize: u(15) })}>
        Motivo da resposta
      </Label>
      <textarea
        id="motivo"
        name="motivo"
        placeholder="Descreva o motivo da resposta"
        className="cpa-textarea"
        style={box(24, 122, 592, 150, { fontSize: u(15) })}
      />

      <Button
        type="button"
        className="cpa-btn cpa-btn--line"
        style={box(220, 292, 200, 44, { borderRadius: u(22), fontSize: u(17) })}
      >
        Enviar resposta
      </Button>
    </>
  );
}
