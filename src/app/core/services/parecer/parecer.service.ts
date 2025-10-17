import { Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { IParecer } from '../../interfaces/parecer.interface';
import { StatusParecerEnum } from '../../enums/status-parecer.enum';

@Injectable({
  providedIn: 'root',
})
export class ParecerService {

  // ✅ Mantém o form principal de parecer
  public parecerForm: FormGroup = new FormGroup({});

  // ✅ Guarda um "snapshot" do parecer atual (valor simples)
  private _parecerSnapshot: IParecer | null = null;

  public get parecerSnapshot(): IParecer | null {
    return this._parecerSnapshot;
  }

  private set parecerSnapshot(parecer: IParecer | null) {
    this._parecerSnapshot = parecer;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {}

  public construirParecerForm( parecer?: IParecer ): FormGroup {

    const form = this._nnfb.group({
      id: this._nnfb.control(parecer?.id ?? 0),
      idProjeto: this._nnfb.control(parecer?.idProjeto ?? 0),
      guidUnidadeOrganizacao: this._nnfb.control(parecer?.guidUnidadeOrganizacao ?? null),
      textoParecer: this._nnfb.control(parecer?.textoParecer ?? '', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      statusParecer: this._nnfb.control(
        parecer?.statusParecer ?? StatusParecerEnum.Pendente
      ),
      dataEnvio: this._nnfb.control(parecer?.dataEnvio ?? null),
      guidDocumentoEdocs: this._nnfb.control(parecer?.guidDocumentoEdocs ?? '')
    });

    this.parecerForm = form;

    this.parecerSnapshot = this.parecerForm.value as IParecer;

    this.parecerForm.valueChanges.subscribe((valor) => {
      this._parecerSnapshot = valor as IParecer;
    });

    return this.parecerForm;

  }

  public atualizarParecer(parecer: IParecer): void {
    if (this.parecerForm) {
      this.parecerForm.patchValue(parecer);
      this._parecerSnapshot = parecer;
    }
  }

  public getValorAtual(): IParecer | null {
    return this._parecerSnapshot;
  }

}
