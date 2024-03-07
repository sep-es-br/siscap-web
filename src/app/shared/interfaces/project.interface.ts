import { IHttpGetResponseBody } from './http-get.interface';

export interface IProject {
  id: number;
  idStatus: number;
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

export interface IProjectTable
  extends Pick<IProject, 'id' | 'sigla' | 'titulo' | 'valorEstimado'> {
  nomesMicrorregioes: string[];
}

export interface IProjectGet extends IHttpGetResponseBody<IProjectTable> {}

export interface IProjectCreate extends Omit<IProject, 'id' | 'idStatus'> {}

export interface IProjectEdit extends Partial<IProject> {}
