/**
 * PROTÓTIPO VISUAL: dados fixos de exemplo.
 * TODO (implementação): trocar por consulta ao back-end.
 */
export type StatusDevolutiva = "nao-procede" | "em-analise" | "concluido";

/** Ordem das barras: vermelha, amarela, verde. */
export const ORDEM_STATUS: StatusDevolutiva[] = ["nao-procede", "em-analise", "concluido"];

/** Nomes sob as barras dos gráficos. */
export const ROTULO_BARRA: Record<StatusDevolutiva, string> = {
  "nao-procede": "Não Procedidas",
  "em-analise": "Em Análise",
  concluido: "Procedidas",
};

/** Texto das etiquetas do mural. */
export const ROTULO_ETIQUETA: Record<StatusDevolutiva, string> = {
  "nao-procede": "Não Procede",
  "em-analise": "Pedido em Análise",
  concluido: "Concluído",
};

export type AnoDevolutivas = {
  ano: number;
  contagem: Record<StatusDevolutiva, number>;
};

export const DEVOLUTIVAS: AnoDevolutivas[] = [
  { ano: 2026, contagem: { "nao-procede": 5, "em-analise": 3, concluido: 1 } },
  { ano: 2025, contagem: { "nao-procede": 2, "em-analise": 2, concluido: 4 } },
  { ano: 2024, contagem: { "nao-procede": 1, "em-analise": 1, concluido: 6 } },
];

export type Manifestacao = {
  id: string;
  texto: string;
  status: StatusDevolutiva;
};

/** As três manifestações do mockup (iguais em todos os anos, só para visualização). */
export const MANIFESTACOES_EXEMPLO: Manifestacao[] = [
  { id: "1", texto: "Queria que devolvessem todo meu dinheiro!!!!!!!!", status: "nao-procede" },
  { id: "2", texto: "Mais uma Máquina de Snacks...", status: "em-analise" },
  { id: "3", texto: "Ter uma área vazia focada para o...", status: "concluido" },
];
