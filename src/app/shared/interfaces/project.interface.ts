//Ver se precisa exportar
export interface GetSort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface IProjectGet {
  totalElements: number;
  totalPages: number;
  size: number;
  content: IProjectTable[];
  number: number;
  sort: GetSort;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: GetSort;
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
  };
  empty: boolean;
}

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

export interface IProjectTable {
  id: number;
  sigla: string;
  titulo: string;
  valorEstimado: number;
  nomesMicrorregioes: string[];
}

export interface ProjectGetRequestBody {
  page?: number;
  size?: number;
  sort?: string | Array<string>[];
}

export type ProjectCreate = Omit<IProject, 'id' | 'idStatus'>;

export type ProjectEdit = Partial<IProject>;
