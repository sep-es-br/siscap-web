import { FormControl } from '@angular/forms';

export type ProspeccaoInteressadoFormType = {
  idInteressado: FormControl<number>;
  emailInteressado: FormControl<string | null>;
};
