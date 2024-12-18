export interface IOpcoesDropdown {
  id: number;
  nome: string;
}

export interface IProjetoPropostoOpcoesDropdown extends IOpcoesDropdown {
  valorEstimado: number;
  idPrograma: number | null;
}

export interface IObjetoOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
}

export interface ILocalidadeOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
  idLocalidadePai: number;
}

export interface IProspeccaoInteressadoOpcoesDropdown extends IOpcoesDropdown {
  email: string;
  idsOrganizacoesList: Array<number>;
}
