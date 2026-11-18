export type TipoRelatorio = "Relatório de Autoavaliação" | "Boletim Informativo";

export type RelatorioDocumento = {
  id: number;
  titulo: string;
  tipo: TipoRelatorio;
  ano: number;
  arquivo_url: string;
};