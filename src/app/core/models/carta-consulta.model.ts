import {
  ICartaConsulta,
  ICartaConsultaDetalhes,
  ICartaConsultaForm,
} from '../interfaces/carta-consulta.interface';
import {
  IObjetoSelectList,
  ISelectList,
} from '../interfaces/select-list.interface';

import { ValorModel } from './valor.model';

export class CartaConsultaFormModel implements ICartaConsultaForm {
  public objeto: IObjetoSelectList;
  public operacao: number;
  public corpo: string;

  constructor(cartaConsultaForm?: ICartaConsultaForm) {
    this.objeto = cartaConsultaForm?.objeto ?? { id: 0, nome: '', tipo: '' };
    this.operacao = cartaConsultaForm?.operacao ?? 0;
    this.corpo = cartaConsultaForm?.corpo ?? '';
  }
}

export class CartaConsultaModel
  extends CartaConsultaFormModel
  implements ICartaConsulta
{
  public readonly id: number;

  constructor(cartaConsulta?: ICartaConsulta) {
    super(cartaConsulta);
    this.id = cartaConsulta?.id ?? 0;
  }
}

export class CartaConsultaDetalhesModel implements ICartaConsultaDetalhes {
  public readonly id: number;
  public objeto: IObjetoSelectList;
  public corpo: string;
  public projetosPropostos: ISelectList[];
  public valor: ValorModel;

  constructor(cartaConsultaDetalhes?: ICartaConsultaDetalhes) {
    this.id = cartaConsultaDetalhes?.id ?? 0;
    this.objeto = cartaConsultaDetalhes?.objeto ?? {
      id: 0,
      nome: '',
      tipo: '',
    };
    this.corpo = cartaConsultaDetalhes?.corpo ?? '';
    this.projetosPropostos = cartaConsultaDetalhes?.projetosPropostos ?? [];
    this.valor = new ValorModel(cartaConsultaDetalhes?.valor);
  }
}
