/**
 * Dados de exemplo para a tela "Resultados da Pesquisa CPA" (somente visual).
 * TODO (implementação): trocar por dados reais vindos do back-end.
 */

/** Um semestre de pesquisa CPA (a pesquisa é semestral). */
export type CpaResultado = {
  id: string; // ex.: "2026-2" (usado nos ids dos campos do HTML)
  periodo: string; // ex.: "2026/2"
};

type QuestaoBase = { id: string; texto: string };

/** Pergunta de alternativas (A–E): `valores` são as porcentagens e devem somar 100. */
export type QuestaoAlternativa = QuestaoBase & { tipo: "alternativa"; valores: number[] };

/** Pergunta discursiva: cada resposta vira uma linha. */
export type QuestaoDiscursiva = QuestaoBase & { tipo: "discursiva"; respostas: string[] };

export type Questao = QuestaoAlternativa | QuestaoDiscursiva;

export const CPAS: CpaResultado[] = [
  { id: "2026-2", periodo: "2026/2" },
  { id: "2026-1", periodo: "2026/1" },
  { id: "2025-2", periodo: "2025/2" },
  { id: "2025-1", periodo: "2025/1" },
];

/** As mesmas perguntas servem de exemplo para todos os semestres (a lista rola a partir da 4ª). */
export const QUESTOES: Questao[] = [
  { id: "1", texto: "Pergunta 1", tipo: "alternativa", valores: [40, 10, 30, 7, 13] },
  { id: "2", texto: "Pergunta 2", tipo: "alternativa", valores: [25, 35, 20, 12, 8] },
  {
    id: "3",
    texto: "Pergunta 3",
    tipo: "discursiva",
    respostas: [
      "A biblioteca precisa de mais tomadas e de horário estendido aos sábados.",
      "Gostaria de mais opções de estágio divulgadas pela coordenação do curso.",
      "O Wi-Fi dos laboratórios cai quando a turma inteira conecta.",
      "As aulas de reposição poderiam ser avisadas com mais antecedência.",
      "Faltam bebedouros no terceiro andar.",
      "Sem observações.",
    ],
  },
  { id: "4", texto: "Pergunta 4", tipo: "alternativa", valores: [50, 20, 15, 10, 5] },
  {
    id: "5",
    texto: "Pergunta 5",
    tipo: "discursiva",
    respostas: [
      "O atendimento da secretaria à noite é muito importante para quem trabalha.",
      "A cantina poderia ter opções mais baratas.",
      "Sugiro um espaço de descanso entre as aulas.",
    ],
  },
  { id: "6", texto: "Pergunta 6", tipo: "alternativa", valores: [15, 15, 40, 20, 10] },
];
