/**
 * PROTÓTIPO VISUAL: dados fixos de exemplo.
 * Modelo (registro 0017): não existem "manifestações" formais. Quando a instituição percebe muitas
 * reclamações sobre o mesmo assunto, ela cria uma DEVOLUTIVA (resposta) com título, área responsável,
 * categoria e justificativa. Só devolutivas com resposta aparecem no Mural.
 * TODO (implementação): trocar por consulta ao banco (Supabase/Prisma).
 */

/**
 * Categoria da resposta. O texto e a COR vêm do banco de dados (cada categoria tem a sua cor).
 * As mesmas categorias valem para as etiquetas do Mural, para as barras da Central e para o
 * dropdown da tela de responder.
 */
export type CategoriaResposta = { id: string; rotulo: string; cor: string };

/** Ordem do dropdown "Categoria da resposta" (a primeira vem selecionada). */
export const CATEGORIAS_RESPOSTA: CategoriaResposta[] = [
  { id: "resolvido", rotulo: "Resolvido", cor: "#00e000" },
  { id: "inapto", rotulo: "Inapto", cor: "#ffeb00" },
  { id: "impertinente", rotulo: "Impertinente", cor: "#f20000" },
];

/** Ordem das barras da Central: vermelha, amarela, verde (antes: Não Procedidas, Em Análise, Procedidas). */
export const ORDEM_BARRAS: string[] = ["impertinente", "inapto", "resolvido"];

export const categoriaPorId = (id: string): CategoriaResposta =>
  CATEGORIAS_RESPOSTA.find((c) => c.id === id) ?? CATEGORIAS_RESPOSTA[0];

/** Número de devolutivas de um ano, por categoria (as barras da Central). */
export type AnoDevolutivas = {
  ano: number;
  contagem: Record<string, number>;
};

export const RESUMO_ANOS: AnoDevolutivas[] = [
  { ano: 2026, contagem: { impertinente: 5, inapto: 3, resolvido: 1 } },
  { ano: 2025, contagem: { impertinente: 2, inapto: 2, resolvido: 4 } },
  { ano: 2024, contagem: { impertinente: 1, inapto: 1, resolvido: 6 } },
  // 2023 e 2022: anos extras de exemplo, só para a barra de rolagem ter o que rolar.
  // Apague-os se a Central deve mostrar apenas 2026, 2025 e 2024.
  { ano: 2023, contagem: { impertinente: 3, inapto: 0, resolvido: 5 } },
  { ano: 2022, contagem: { impertinente: 4, inapto: 1, resolvido: 2 } },
];

/** Devolutiva (resposta da instituição a um assunto muito citado na pesquisa). */
export type Devolutiva = {
  id: string;
  titulo: string;
  area: string;
  /** id de uma CategoriaResposta */
  categoria: string;
  justificativa: string;
};

/** Três devolutivas de exemplo (iguais em todos os anos, só para visualização). */
export const DEVOLUTIVAS_EXEMPLO: Devolutiva[] = [
  {
    id: "1",
    titulo: "Pedidos de devolução do valor das mensalidades",
    area: "Secretaria",
    categoria: "impertinente",
    justificativa:
      "A pesquisa CPA avalia a instituição e não trata de pedidos financeiros. Para pedidos de reembolso, procure a Secretaria.",
  },
  {
    id: "2",
    titulo: "Mais máquinas de snacks",
    area: "Infraestrutura",
    categoria: "inapto",
    justificativa:
      "O contrato atual prevê um número fixo de máquinas por andar. A ampliação não é possível neste momento.",
  },
  {
    id: "3",
    titulo: "Área vazia de convivência",
    area: "Infraestrutura",
    categoria: "resolvido",
    justificativa:
      "Diversos alunos pediram um espaço de convivência. A Infraestrutura reservou uma área no térreo, que será aberta no próximo semestre.",
  },
];
