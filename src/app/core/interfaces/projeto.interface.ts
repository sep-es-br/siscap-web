import { IEquipe } from './equipe.interface';
import { IRateio } from './rateio.interface';
import { IValor } from './valor.interface';

export interface IProjeto {
  readonly id: number;
  readonly idStatus: number;
  sigla: string;
  titulo: string;
  idOrganizacao: number;
  valor: IValor;
  rateio: Array<IRateio>;
  objetivo: string;
  objetivoEspecifico: string;
  situacaoProblema: string;
  solucoesPropostas: string;
  impactos: string;
  arranjosInstitucionais: string;
  idResponsavelProponente: number;
  equipeElaboracao: Array<IEquipe>;
}

export interface IProjetoForm extends Omit<IProjeto, 'id' | 'idStatus'> {}

export interface IProjetoTableData
  extends Pick<IProjeto, 'id' | 'sigla' | 'titulo'> {
  moeda: string;
  valor: number;
  nomesLocalidadesRateio: Array<string>;
}
