import { IObjetoSelectList } from './select-list.interface';

export interface ICartaConsulta {
  readonly id: number;
  objeto: IObjetoSelectList;
  operacao: number;
  corpo: string; // EDITOR DE TEXTO ROBUSTO, VER EXEMPLO 'quill.js'
}

export interface ICartaConsultaForm extends Omit<ICartaConsulta, 'id'> {}

export interface ICartaConsultaTableData
  extends Pick<ICartaConsulta, 'id' | 'operacao'> {
  nomeObjeto: string;
  data: string; // DATA DE CRIAÇÃO (PUXAR 'criado_em'?)
}
