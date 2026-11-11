/** Rede de pontos decorativa do fundo do login (posições fixas, sem aleatoriedade real). */
function gerarPontos() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 46 }, () => ({
    x: Math.round(rnd() * 960),
    y: Math.round(rnd() * 540),
    r: Math.round((2 + rnd() * 6) * 10) / 10,
  }));
}

export function RedeDePontos() {
  const pontos = gerarPontos();
  const linhas: { a: number; b: number }[] = [];
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      const dx = pontos[i].x - pontos[j].x;
      const dy = pontos[i].y - pontos[j].y;
      if (dx * dx + dy * dy < 150 * 150) linhas.push({ a: i, b: j });
    }
  }

  return (
    <svg aria-hidden viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" className="cpa-net">
      {linhas.map(({ a, b }) => (
        <line
          key={`${a}-${b}`}
          x1={pontos[a].x}
          y1={pontos[a].y}
          x2={pontos[b].x}
          y2={pontos[b].y}
          stroke="#fff"
          strokeOpacity={0.22}
        />
      ))}
      {pontos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fff" fillOpacity={0.35} />
      ))}
    </svg>
  );
}
