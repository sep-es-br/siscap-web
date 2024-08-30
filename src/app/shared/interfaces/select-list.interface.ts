export interface ISelectList {
  id: number;
  nome: string;
}

export interface ICidadeSelectList extends ISelectList {
  idMicrorregiao: number;
}

export interface IMicrorregiaoCidadesSelectList {
  id: number;
  nome: string;
  cidades: Array<ISelectList>;
}