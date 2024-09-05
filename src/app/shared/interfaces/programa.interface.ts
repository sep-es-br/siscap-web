import { IEquipe } from './equipe.interface';
import { IValor } from './valor.interface';

export interface IProgramaProjetoProposto {
  idProjeto: number;
  valor: number;
}

export interface IPrograma {
  readonly id: number;
  sigla: string;
  titulo: string;
  idOrgaoExecutor: number;
  equipeCaptacao: Array<IEquipe>;
  projetosPropostos: Array<IProgramaProjetoProposto>;
  valor: IValor;
}

export interface IProgramaForm extends Omit<IPrograma, 'id'> {}

export interface IProgramaTableData
  extends Pick<IPrograma, 'id' | 'sigla' | 'titulo'> {
  moeda: string;
  valor: number;
}
