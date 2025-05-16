import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { TipoStatusEnum } from '../../enums/tipo-status.enum';
import { IOpcoesDropdown } from '../../interfaces/opcoes-dropdown.interface';
import { IAcao } from '../../interfaces/acoes.interface';
import { AcaoFormType } from '../../types/form/acao-form.type';

@Injectable({
  providedIn: 'root',
})
export class AcoesService {

  public acoesFormArray: FormArray<FormGroup<AcaoFormType>> = new FormArray<
    FormGroup<AcaoFormType>
  >([]);

  private _acoesFormArraySnapshot: Array<IAcao> = [];

  public get acoesFormArraySnapshot(): Array<IAcao> {
    return this._acoesFormArraySnapshot;
  }

  private set acoesFormArraySnapshot(indicadoresFormArrayValue: Array<IAcao>) {
    this._acoesFormArraySnapshot = indicadoresFormArrayValue;
  }

  private readonly _idAcaoAcoesValue$: Subject<number> = new Subject<number>();

  public get idAcaoAcoesValue$(): Subject<number> {
    return this._idAcaoAcoesValue$;
  }

  public excluirMembroForm: FormGroup = new FormGroup({});

  public get excluirMembroFormMembroStatusFormControl(): FormControl<
    number | null
  > {
    return this.excluirMembroForm.get('membroStatus') as FormControl<
      number | null
    >;
  }

  public get excluirMembroFormJustificativaFormControl(): FormControl<
    string | null
  > {
    return this.excluirMembroForm.get('justificativa') as FormControl<
      string | null
    >;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {
    this.idAcaoAcoesValue$.subscribe((idAcaoAcoesValue: number) => {
      const indicadorMontado = this.construirAcaoFormGroupNgSelectValue(idAcaoAcoesValue);
      this.incluirAcao( indicadorMontado );
    });
  }

    public construirAcaoFormGroupNgSelectValue(
      ngSelectValue: number
    ): FormGroup<AcaoFormType> {
      const membroFormGroup = this.construirAcaoFormGroup();
      return membroFormGroup;
    }

  public construirAcoesFormArray(
    acoes?: Array<IAcao>
  ): FormArray<FormGroup<AcaoFormType>> {
    const acoesFormArray = this._nnfb.array<FormGroup<AcaoFormType>>([],[]);
    if (acoes) {
        acoes.forEach((acao) => {
          acoesFormArray.push(this.construirAcaoFormGroup(acao));
      });
    }
    this.acoesFormArray = acoesFormArray;
    this.acoesFormArraySnapshot = this.acoesFormArray.value as Array<IAcao>;
    return this.acoesFormArray;
  }

  public construirAcaoFormGroup( membro?: IAcao): FormGroup<AcaoFormType> {
    return this._nnfb.group<AcaoFormType>({
      descricaoAcaoPrincipal: this._nnfb.control(membro?.descricaoAcaoPrincipal ?? null, Validators.required ),
      descricaoAcaoSecundaria: this._nnfb.control(membro?.descricaoAcaoSecundaria ?? null, Validators.required ),
      valorEstimadoAcaoPrincipal: this._nnfb.control(membro?.valorEstimadoAcaoPrincipal ?? 0, Validators.required ),
      idStatus: this._nnfb.control(membro?.idStatus ?? TipoStatusEnum.Ativo, Validators.required 
      ),
    });
  }

 
  public incluirAcao(
    acaoFormGroup: FormGroup<AcaoFormType>
  ): void {
    this.acoesFormArray.push(acaoFormGroup);
  }

  public removerAcao(index: number): void {
    this.acoesFormArray.removeAt(index);
  }

  public construirExcluirAcaoForm(): FormGroup {
    const excluirAcaoForm = this._nnfb.group({
      membroStatus: this._nnfb.control(null, Validators.required),
    });
    this.excluirMembroForm = excluirAcaoForm;
    return this.excluirMembroForm;
  }

}
