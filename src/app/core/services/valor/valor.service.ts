import { Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

import { IValor } from '../../interfaces/valor.interface';

import { ValorFormType } from '../../types/form/valor-form.type';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValorService {

  private readonly _valorForm$ =
    new BehaviorSubject<FormGroup<ValorFormType>>(this.construirValorFormGroup());

  valorForm$ = this._valorForm$.asObservable();

  setForm(valor?: IValor) {
    this._valorForm$.next(this.construirValorFormGroup(valor));
  }

  public valorFormGroup: FormGroup<ValorFormType> =
    this.construirValorFormGroup();

  constructor(private readonly _nnfb: NonNullableFormBuilder) { }

  public construirValorFormGroup(valor?: IValor): FormGroup<ValorFormType> {
    const valorFormGroup = this._nnfb.group<ValorFormType>({
      tipo: this._nnfb.control(valor?.tipo ?? null, {
        validators: Validators.required,
      }),
      moeda: this._nnfb.control(valor?.moeda ?? 'BRL', {
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
