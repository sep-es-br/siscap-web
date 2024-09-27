export interface ISelectList {
  id: number;
  nome: string;
}

export interface ICidadeSelectList extends ISelectList {
  idMicrorregiao: number;
}
