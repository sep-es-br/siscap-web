import { Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { IValor } from '../../interfaces/valor.interface';

import { ValorFormType } from '../../types/form/valor-form.type';

@Injectable({
  providedIn: 'root',
})
export class ValorService {
  public valorFormGroup: FormGroup<ValorFormType> =
    this.construirValorFormGroup();

  constructor(private _nnfb: NonNullableFormBuilder) {}

  public construirValorFormGroup(valor?: IValor): FormGroup<ValorFormType> {
    const valorFormGroup = this._nnfb.group<ValorFormType>({
      tipo: this._nnfb.control(valor?.tipo ?? null, {
        validators: Validators.required,
      }),
      moeda: this._nnfb.control(valor?.moeda ?? null, {
        validators: Validators.required,
      }),
      quantia: this._nnfb.control(valor?.quantia ?? null, {
        validators: [Validators.required, Validators.min(1)],
      }),
    });

    this.valorFormGroup = valorFormGroup;

    return this.valorFormGroup;
  }
}
