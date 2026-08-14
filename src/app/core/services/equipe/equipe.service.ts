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
import { EquipeModel } from '../../models/equipe.model';
import { UsuarioService } from '../usuario/usuario.service';

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

  private readonly _idMembroNgSelectValue$: Subject<IOpcoesDropdownResponsavelProponente> = new Subject<IOpcoesDropdownResponsavelProponente>();

  public get idMembroNgSelectValue$(): Subject<IOpcoesDropdownResponsavelProponente> {
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

  constructor(private _nnfb: NonNullableFormBuilder,
     private readonly _usuarioService: UsuarioService
  ) {
    this.idMembroNgSelectValue$.subscribe((idMembroNgSelectValue: IOpcoesDropdownResponsavelProponente) => {
      this.incluirMembroNaEquipe(
        this.construirMembroFormGroupNgSelectValue(idMembroNgSelectValue)
      );
    });
  }

  public construirEquipeFormArray(
    equipe?: Array<IEquipe>,
    exibirRedator: boolean = true
  ): FormArray<FormGroup<EquipeFormType>> {

    const equipeFormArray = this._nnfb.array<FormGroup<EquipeFormType>>(
      [],[
        // Validators.required, 
        Validators.minLength(1), equipeValidator()]
    );

    if (equipe) {
      equipe.forEach((membro) => {
        equipeFormArray.push(this.construirMembroFormGroup(membro));
      });
    } else {

      if (exibirRedator){

        const novoMembro: EquipeModel = {
          subPessoa: this._usuarioService.usuarioPerfil.subNovo,
          idPessoa: this._usuarioService.usuarioPerfil.idPessoa,
          idPapel: TipoPapelEnum.Redator,
          idStatus: TipoStatusEnum.Ativo,
          justificativa: null,
          nome: this._usuarioService.usuarioPerfil.nome,
          papelNome: ''
        };

        equipeFormArray.push(this.construirMembroFormGroup(novoMembro));

      }

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
      idStatus: this._nnfb.control(membro?.idStatus ?? TipoStatusEnum.Ativo, Validators.required),
      justificativa: this._nnfb.control(membro?.justificativa ?? null),
      nome: this._nnfb.control(membro?.nome ?? '')
    });

  }

  public construirMembroFormGroupNgSelectValue(
    ngSelectValue: IOpcoesDropdownResponsavelProponente
  ): FormGroup<EquipeFormType> {
    const membroFormGroup = this.construirMembroFormGroup();
    membroFormGroup.patchValue({ subPessoa: ngSelectValue.agentePublicoSub, nome: ngSelectValue.nome });
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
