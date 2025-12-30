import {
  IObjetoOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownDestinatariosCartaConsulta,
} from './opcoes-dropdown.interface';
import { IValor } from './valor.interface';

export interface ICartaConsulta {
  readonly id: number;
  objeto: IObjetoOpcoesDropdown;
  operacao: number | null;
  corpo: string;
  destinatarios: IOpcoesDropdownDestinatariosCartaConsulta[];
}

export interface ICartaConsultaForm extends Omit<ICartaConsulta, 'id'> {}

export interface ICartaConsultaTableData extends Pick<ICartaConsulta, 'id'> {
  readonly prospectado: boolean;
  codigoCartaConsulta: string;
  nomeTipoOperacao: string;
  nomeObjeto: string;
  data: string;
}

export interface ICartaConsultaDetalhes
  extends Pick<ICartaConsulta, 'id' | 'objeto' | 'corpo'> {
  readonly prospectado: boolean;
  codigoCartaConsulta: string;
  projetosPropostos: Array<IOpcoesDropdown>;
  valor: IValor;
}
