export interface ColumnTitleObject {
  readonly [key: string]: string;
}

export const projetosColumnTitles = {
  sigla: 'Sigla',
  titulo: 'Nome do Projeto',
  valorEstimado: 'Valor',
  nomesMicrorregioes: 'Microrregiões',
} as ColumnTitleObject;

export const programasColumnTitles = {
  prop1: 'Propriedade 1',
  // replicar lógica para demais propriedades
} as ColumnTitleObject;
