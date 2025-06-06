import { FormControl } from '@angular/forms';

export type AcaoFormType = {
  idAcao: FormControl<number>;
  descricaoAcaoPrincipal: FormControl<string | null>;
  descricaoAcaoSecundaria: FormControl<string | null>;
  valorEstimadoAcaoPrincipal: FormControl<number>;
  idStatus: FormControl<number>;
};

export type AcaoFormTypeValue = Array<
  Partial<{
    idAcao: number;
    descricaoAcaoPrincipal: string | null;
    descricaoAcaoSecundaria: string | null;
    valorEstimadoAcaoPrincipal: number;
    idStatus: number;
  }>
>;
