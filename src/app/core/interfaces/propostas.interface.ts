import { IProjeto } from './projeto.interface';

export interface IProposta extends Omit<IProjeto, 'rateio' | 'valor'> {
  valorEstimado: number;
  idMicrorregioesList: Array<number>;
}

export interface IPropostaForm extends Omit<IProposta, 'id' | 'idStatus'> {}

export interface IPropostaTableData
  extends Pick<IProposta, 'id' | 'sigla' | 'titulo'> {
  valorEstimado: number;
  nomesMicrorregioes: Array<string>;
  //ORGAO RESPONSAVEL?
  //NOME AUTOR?
}
