import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';

import { IOpcoesDropdownResponsavelProponente } from '../../interfaces/opcoes-dropdown.interface';
import { IEquipe } from '../../interfaces/equipe.interface';

import { EquipeFormType } from '../../types/form/equipe-form.type';

import { TipoStatusEnum } from '../../enums/tipo-status.enum';
import { equipeValidator } from '../../validators/equipe.validator';
import { TipoPapelEnum } from '../../enums/tipo-papel.enum';

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

  private readonly _idMembroNgSelectValue$: Subject<string> = new Subject<string>();

  public get idMembroNgSelectValue$(): Subject<string> {
    return this._idMembroNgSelectValue$;
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
    this.idMembroNgSelectValue$.subscribe((idMembroNgSelectValue: string) => {
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
      [Validators.required, Validators.minLength(1), equipeValidator()]
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
      subPessoa: this._nnfb.control(membro?.subPessoa ?? null),
      idPessoa: this._nnfb.control(membro?.idPessoa ?? 0, Validators.required),
      idPapel: this._nnfb.control(membro?.idPapel ?? null, Validators.required),
      idStatus: this._nnfb.control(
        membro?.idStatus ?? TipoStatusEnum.Ativo,
        Validators.required
      ),
      justificativa: this._nnfb.control(membro?.justificativa ?? null),
    });
  }

  public construirMembroFormGroupNgSelectValue(
    ngSelectValue: string
  ): FormGroup<EquipeFormType> {
    const membroFormGroup = this.construirMembroFormGroup();
    membroFormGroup.patchValue({ subPessoa: ngSelectValue });
    return membroFormGroup;
  }

  public usuarioProponenteValoresIniciaisEquipeFormArray(
    usuarioProponente_IdPessoa: number
  ): void {
    const usuarioProponente_IEquipe: IEquipe = {
      subPessoa: null,
      idPessoa: usuarioProponente_IdPessoa,
      idPapel: TipoPapelEnum.Proponente,
      idStatus: TipoStatusEnum.Ativo,
      justificativa: null,
    };

    const usuarioProponente_MembroFormGroup = this.construirMembroFormGroup(
      usuarioProponente_IEquipe
    );

    this.incluirMembroNaEquipe(usuarioProponente_MembroFormGroup);
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

  public filtrarPessoasOpcoes(
    pessoasOpcoes: IOpcoesDropdownResponsavelProponente[]
  ): IOpcoesDropdownResponsavelProponente[] {
    return pessoasOpcoes.filter(
      (pessoa) =>
        !this.equipeFormArray.value.some(
          (membro) => membro.subPessoa === pessoa.agentePublicoSub
        )
    );
  }
}
