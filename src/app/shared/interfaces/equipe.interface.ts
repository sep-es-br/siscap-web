import { FormControl } from '@angular/forms';

export interface IEquipe {
  idPessoa: number;
  idPapel: number;
  idStatus: number;
  justificativa: string;
}

export interface IEquipeForm {
  idPessoa: FormControl<number | null>;
  idPapel: FormControl<number | null>;
  idStatus: FormControl<number | null>;
  justificativa: FormControl<string | null>;
}
