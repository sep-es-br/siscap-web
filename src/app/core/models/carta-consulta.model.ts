import {
  ICartaConsulta,
  ICartaConsultaForm,
} from '../interfaces/carta-consulta.interface';
import { IObjetoSelectList } from '../interfaces/select-list.interface';

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
