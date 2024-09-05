import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';

import { ISelectList } from '../../interfaces/select-list.interface';
import { IEquipe } from '../../interfaces/equipe.interface';

import { EquipeFormType } from '../../types/form/equipe-form.type';

import { StatusEnum } from '../../enums/status.enum';

@Injectable({
  providedIn: 'root',
})
export class EquipeService {
  public equipeFormArray: FormArray<FormGroup<EquipeFormType>> = new FormArray<
    FormGroup<EquipeFormType>
  >([]);

  private _equipeFormArraySnapshot: Array<IEquipe> = [];

  public get equipeFormArraySnapshot(): Array<IEquipe> {
    return this._equipeFormArraySnapshot;
  }

  private set equipeFormArraySnapshot(equipeFormArrayValue: Array<IEquipe>) {
    this._equipeFormArraySnapshot = equipeFormArrayValue;
  }

  private _idMembroNgSelectValue$: Subject<number> = new Subject<number>();

  public get idMembroNgSelectValue$(): Subject<number> {
    return this._idMembroNgSelectValue$;
  }

  public excluirMembroForm: FormGroup = new FormGroup({});

  public get excluirMembroFormMembroStatusFormControl(): FormControl<number | null> {
    return this.excluirMembroForm.get('membroStatus') as FormControl<
      number | null
    >;
  }

  public get excluirMembroFormJustificativaFormControl(): FormControl<string | null> {
    return this.excluirMembroForm.get('justificativa') as FormControl<
      string | null
    >;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {
    this.idMembroNgSelectValue$.subscribe((idMembroNgSelectValue: number) => {
      this.incluirMembroNaEquipe(
        this.construirMembroFormGroupNgSelectValue(idMembroNgSelectValue)
      );
    });
  }

  public construirEquipeFormArray(
    equipe?: Array<IEquipe>
  ): FormArray<FormGroup<EquipeFormType>> {
    const equipeFormArray = this._nnfb.array<FormGroup<EquipeFormType>>(
      [],
      [Validators.required, Validators.minLength(1)]
    );

    if (equipe) {
      equipe.forEach((membro) => {
        equipeFormArray.push(this.construirMembroFormGroup(membro));
      });
    }

    this.equipeFormArray = equipeFormArray;

    this.equipeFormArraySnapshot = this.equipeFormArray.value as Array<IEquipe>;

    return this.equipeFormArray;
  }

  public construirMembroFormGroup(membro?: IEquipe): FormGroup<EquipeFormType> {
    return this._nnfb.group<EquipeFormType>({
      idPessoa: this._nnfb.control(membro?.idPessoa ?? 0, Validators.required),
      idPapel: this._nnfb.control(membro?.idPapel ?? null, Validators.required),
      idStatus: this._nnfb.control(
        membro?.idStatus ?? StatusEnum.Ativo,
        Validators.required
      ),
      justificativa: this._nnfb.control(membro?.justificativa ?? null),
    });
  }

  public construirMembroFormGroupNgSelectValue(
    ngSelectValue: number
  ): FormGroup<EquipeFormType> {
    const membroFormGroup = this.construirMembroFormGroup();
    membroFormGroup.patchValue({ idPessoa: ngSelectValue });
    return membroFormGroup;
  }

  public incluirMembroNaEquipe(
    membroFormGroup: FormGroup<EquipeFormType>
  ): void {
    this.equipeFormArray.push(membroFormGroup);
  }

  public removerMembroDaEquipe(index: number): void {
    this.equipeFormArray.removeAt(index);
  }

  public construirExcluirMembroForm(): FormGroup {
    const excluirMembroForm = this._nnfb.group({
      membroStatus: this._nnfb.control(null, Validators.required),
      justificativa: this._nnfb.control(null, [
        Validators.required,
        Validators.maxLength(255),
      ]),
    });

    this.excluirMembroForm = excluirMembroForm;

    return this.excluirMembroForm;
  }

  public filtrarPessoasList(pessoasList: ISelectList[]): ISelectList[] {
    return pessoasList.filter(
      (pessoa) =>
        !this.equipeFormArray.value.some(
          (membro) => membro.idPessoa === pessoa.id
        )
    );
  }
}
