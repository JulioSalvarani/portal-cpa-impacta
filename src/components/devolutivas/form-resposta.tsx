import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIAS_RESPOSTA } from "@/lib/devolutivas-data";
import { box, u } from "@/lib/cpa-box";

/**
 * Áreas responsáveis reais (definidas pelo usuário, reg. 0015).
 * TODO (implementação): carregar da tabela `areas` (coluna `nome_area`) do Supabase.
 */
const AREAS = [
  "Coordenação",
  "Infraestrutura",
  "Reitoria",
  "Secretaria",
  "Secretaria de Coordenação",
  "TI",
];

/**
 * PROTÓTIPO VISUAL: campos sem envio nem validação.
 * As coordenadas são relativas ao cartão cinza (640 × 400 no mockup, registro 0016).
 * Categorias: Resolvido, Inapto e Impertinente, vindas de CATEGORIAS_RESPOSTA (no futuro, do banco).
 * TODO (implementação): envolver em <form>, ligar ao envio e trocar o botão por type="submit".
 */
export function FormResposta() {
  return (
    <>
      {/* Título da resposta (registro 0016) */}
      <Label htmlFor="titulo" className="cpa-flabel" style={box(24, 18, 592, 22, { fontSize: u(15) })}>
        Título da resposta
      </Label>
      <Input
        id="titulo"
        name="titulo"
        type="text"
        placeholder="Escreva o título"
        autoComplete="off"
        className="cpa-field"
        style={box(24, 42, 592, 34, { fontSize: u(16) })}
      />

      <Label htmlFor="area" className="cpa-flabel" style={box(24, 92, 290, 22, { fontSize: u(15) })}>
        Área responsável
      </Label>
      <select
        id="area"
        name="area"
        defaultValue=""
        className="cpa-field cpa-select"
        style={box(24, 116, 290, 34, { fontSize: u(16) })}
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

      <Label htmlFor="categoria" className="cpa-flabel" style={box(326, 92, 290, 22, { fontSize: u(15) })}>
        Categoria da resposta
      </Label>
      <select
        id="categoria"
        name="categoria"
        defaultValue={CATEGORIAS_RESPOSTA[0].id}
        className="cpa-field cpa-select"
        style={box(326, 116, 290, 34, { fontSize: u(16) })}
      >
        {CATEGORIAS_RESPOSTA.map((c) => (
          <option key={c.id} value={c.id}>
            {c.rotulo}
          </option>
        ))}
      </select>

      <Label htmlFor="motivo" className="cpa-flabel" style={box(24, 166, 592, 22, { fontSize: u(15) })}>
        Motivo da resposta
      </Label>
      <textarea
        id="motivo"
        name="motivo"
        placeholder="Descreva o motivo da resposta"
        className="cpa-textarea"
        style={box(24, 190, 592, 130, { fontSize: u(15) })}
      />

      <Button
        type="button"
        className="cpa-btn cpa-btn--line"
        style={box(220, 338, 200, 44, { borderRadius: u(22), fontSize: u(17) })}
      >
        Enviar resposta
      </Button>
    </>
  );
}
