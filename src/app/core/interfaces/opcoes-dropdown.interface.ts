export interface IOpcoesDropdown {
  id: number;
  nome: string;
}

export interface IProjetoPropostoOpcoesDropdown extends IOpcoesDropdown {
  valorEstimado: number;
}

export interface IObjetoOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
}

export interface ILocalidadeOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
  idLocalidadePai: number;
}
