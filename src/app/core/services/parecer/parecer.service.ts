import { Injectable } from '@angular/core';
import {
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { IParecer } from '../../interfaces/parecer.interface';

@Injectable({
  providedIn: 'root',
})
export class ParecerService {

  private _parecerSnapshot: IParecer | null = null;

  public get parecerSnapshot(): IParecer | null {
    return this._parecerSnapshot;
  }

  private set parecerSnapshot(parecer: IParecer | null) {
    this._parecerSnapshot = parecer;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {}

  public construirParecerForm(parecer?: IParecer): FormGroup {
    return this._nnfb.group({
      id: [parecer?.id ?? 0],
      idProjeto: [parecer?.idProjeto ?? 0],
      guidUnidadeOrganizacao: [parecer?.guidUnidadeOrganizacao ?? null],
      textoParecer: [parecer?.textoParecer ?? '', [Validators.required, Validators.maxLength(2000)]],
      statusParecer: [parecer?.statusParecer ?? null],
      dataEnvio: [parecer?.dataEnvio ?? null],
      guidDocumentoEdocs: [parecer?.guidDocumentoEdocs ?? null],
    });
  }

  public getValorAtual(): IParecer | null {
    return this._parecerSnapshot;
  }

}
