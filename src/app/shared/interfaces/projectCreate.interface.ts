export interface IProjectCreate {
  sigla: string;
  titulo: string;
  idEntidade: number;
  valorEstimado: number;
  idMicrorregioes: number[];
  objetivo: string;
  objetivoEspecifico: string;
  situacaoProblema: string;
  solucoesPropostas: string;
  impactos: string;
  arranjosInstitucionais: string;
}
