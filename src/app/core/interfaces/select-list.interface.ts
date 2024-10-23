export interface ISelectList {
  id: number;
  nome: string;
}

export interface ICidadeSelectList extends ISelectList {
  idMicrorregiao: number;
}

export interface IProjetoPropostoSelectList extends ISelectList {
  valorEstimado: number;
}

export interface IObjetoSelectList extends ISelectList {
  tipo: string;
}

export interface ILocalidadeSelectList extends ISelectList {
  tipo: string;
  idLocalidadePai: number;
}
