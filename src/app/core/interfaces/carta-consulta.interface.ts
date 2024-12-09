import {
  IObjetoOpcoesDropdown,
  IOpcoesDropdown,
} from './opcoes-dropdown.interface';
import { IValor } from './valor.interface';

export interface ICartaConsulta {
  readonly id: number;
  objeto: IObjetoOpcoesDropdown;
  operacao: number;
  corpo: string;
}

export interface ICartaConsultaForm extends Omit<ICartaConsulta, 'id'> {}

export interface ICartaConsultaTableData extends Pick<ICartaConsulta, 'id'> {
  nomeTipoOperacao: string;
  nomeObjeto: string;
  data: string;
}

export interface ICartaConsultaDetalhes
  extends Pick<ICartaConsulta, 'id' | 'objeto' | 'corpo'> {
  projetosPropostos: Array<IOpcoesDropdown>;
  valor: IValor;
}
