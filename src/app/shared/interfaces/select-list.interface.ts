export interface ISelectList {
  id: number;
  nome: string;
}

export interface IMicrorregiaoCidadesSelectList {
  id: number;
  nome: string;
  cidades: Array<ISelectList>;
}