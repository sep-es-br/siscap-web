import { FormControl } from '@angular/forms';

export interface IRateio {
  idCidade: number;
  quantia: number;
}

export interface IRateioForm {
  idCidade: FormControl<number | null>;
  quantia: FormControl<number | null>;
}
