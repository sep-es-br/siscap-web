import { FormControl } from '@angular/forms';

// export interface IRateio {
//   idCidade: number;
//   quantia: number;
// }

// export interface IRateioForm {
//   idCidade: FormControl<number | null>;
//   quantia: FormControl<number | null>;
// }

export interface IRateio {
  rateioMicrorregiao: Array<IRateioMicrorregiao>;
  rateioCidade: Array<IRateioCidade>;
}

export interface IRateioMicrorregiao {
  idMicrorregiao: number;
  percentual: number;
  quantia: number;
}

export interface IRateioCidade {
  idCidade: number;
  percentual: number;
  quantia: number;
}
