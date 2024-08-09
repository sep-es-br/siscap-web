import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { IEquipe, IEquipeForm } from './equipe.interface';
import { IRateio, IRateioForm } from './rateio.interface';

export interface IProjeto {
  readonly id: number;
  readonly idStatus: number;
  sigla: string;
  titulo: string;
  idOrganizacao: number;
  valorEstimado: number;
  // idMicrorregioes: number[];
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

export interface IProjetoForm {
  sigla: FormControl<string | null>;
  titulo: FormControl<string | null>;
  idOrganizacao: FormControl<number | null>;
  valorEstimado: FormControl<number | null>;
  // idMicrorregioes: FormControl<number[] | null>;
  rateio: FormArray<FormGroup<IRateioForm>>;
  objetivo: FormControl<string | null>;
  objetivoEspecifico: FormControl<string | null>;
  situacaoProblema: FormControl<string | null>;
  solucoesPropostas: FormControl<string | null>;
  impactos: FormControl<string | null>;
  arranjosInstitucionais: FormControl<string | null>;
  idResponsavelProponente: FormControl<number | null>;
  equipeElaboracao: FormArray<FormGroup<IEquipeForm>>;
}

export interface IProjetoTableData
  extends Pick<IProjeto, 'id' | 'sigla' | 'titulo' | 'valorEstimado'> {
  nomesMicrorregioes: string[];
}

// export interface IProjetoForm extends Omit<IProjeto, 'id' | 'idStatus'> {}

// export interface IProjetoCreateBody extends Omit<IProjeto, 'id' | 'idStatus'> {}

// export interface IProjectUpdate extends Partial<IProjectCreate> {}
