import { FormControl } from '@angular/forms';
import { IRateio, IRateioForm } from '../interfaces/rateio.interface';

export class RateioModel implements IRateio {
  public idCidade: number = 0;
  public quantia: number = 0;

  constructor(rateioCidade?: IRateio) {
    this.idCidade = rateioCidade?.idCidade ?? 0;
    this.quantia = rateioCidade?.quantia ?? 0;
  }
}

export class RateioFormModel implements IRateioForm {
  public idCidade: FormControl<number | null> = new FormControl(null);
  public quantia: FormControl<number | null> = new FormControl(null);

  constructor(rateioCidade?: IRateio) {
    this.idCidade.setValue(rateioCidade?.idCidade ?? null);
    this.quantia.setValue(rateioCidade?.quantia ?? null);
  }
}
