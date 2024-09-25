import { FormControl } from '@angular/forms';

export type ProgramaProjetoPropostoFormType = {
  idProjeto: FormControl<number>;
  valor: FormControl<number | null>;
};
