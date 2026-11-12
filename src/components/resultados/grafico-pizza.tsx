/** Cores das alternativas A–E (iguais às do mockup). */
const CORES = ["#00a9dc", "#ffa400", "#3b8de0", "#86c00a", "#6f7f7f"];
const LETRAS = ["A", "B", "C", "D", "E"];

/** Desenho em unidades próprias do SVG (viewBox 378 × 234); ele escala com a caixa do gráfico. */
const CX = 193;
const CY = 121;
const R = 74;

const n = (v: number) => Math.round(v * 10) / 10;
/** Ponto a `r` do centro, em `graus` a partir do topo, no sentido horário. */
const ponto = (graus: number, r: number): [number, number] => {
  const rad = (graus * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
};

/**
 * Pizza das respostas alternativas: porcentagem em cada fatia e uma letra (elipse com seta) ao redor,
 * como no mockup. `valores` = porcentagens de A a E, somando 100.
 */
export function GraficoPizza({ valores, titulo }: { valores: number[]; titulo: string }) {
  const resumo = valores.map((v, i) => `${LETRAS[i]}: ${v}%`).join("; ");
  let inicio = 0;

  const fatias = valores.map((valor, i) => {
    const fim = inicio + (valor / 100) * 360;
    const meio = (inicio + fim) / 2;
    const cor = CORES[i] ?? "#999999";

    const [x1, y1] = ponto(inicio, R);
    const [x2, y2] = ponto(fim, R);
    const caminho =
      valor >= 100
        ? `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R} Z`
        : `M ${CX} ${CY} L ${n(x1)} ${n(y1)} A ${R} ${R} 0 ${fim - inicio > 180 ? 1 : 0} 1 ${n(x2)} ${n(y2)} Z`;

    const [tx, ty] = ponto(meio, R * 0.62);
    // Letra numa elipse fora da pizza; a seta liga o contorno da fatia à letra.
    const rad = (meio * Math.PI) / 180;
    const lx = CX + 128 * Math.sin(rad);
    const ly = CY - 98 * Math.cos(rad);
    const [ax, ay] = ponto(meio, R + 3);
    const dx = lx - ax;
    const dy = ly - ay;
    const dist = Math.hypot(dx, dy) || 1;
    const ex = lx - (dx / dist) * 15;
    const ey = ly - (dy / dist) * 12;
    const ang = Math.atan2(ey - ay, ex - ax);
    const ponta = [ang + 2.7, ang - 2.7].map((a) => `${n(ex + 4.5 * Math.cos(a))},${n(ey + 4.5 * Math.sin(a))}`);

    inicio = fim;
    return (
      <g key={i}>
        <path d={caminho} fill={cor} stroke="#d9d9d9" strokeWidth="0.8" />
        {valor >= 4 && (
          <text x={n(tx)} y={n(ty)} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill="#111">
            {valor}%
          </text>
        )}
        <line x1={n(ax)} y1={n(ay)} x2={n(ex)} y2={n(ey)} stroke="#111" strokeWidth="0.9" />
        <polyline points={`${ponta[0]} ${n(ex)},${n(ey)} ${ponta[1]}`} fill="none" stroke="#111" strokeWidth="0.9" />
        <ellipse cx={n(lx)} cy={n(ly)} rx="14" ry="11" fill={cor} />
        <text x={n(lx)} y={n(ly)} textAnchor="middle" dominantBaseline="central" fontSize="15" fill="#111">
          {LETRAS[i]}
        </text>
      </g>
    );
  });

  return (
    <svg
      viewBox="0 0 378 234"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${titulo}. ${resumo}.`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {fatias}
    </svg>
  );
}
