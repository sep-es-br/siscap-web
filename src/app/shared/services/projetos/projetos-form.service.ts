import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { ProjetoFormModel } from '../../models/projeto.model';
import { EquipeFormModel } from '../../models/equipe.model';

@Injectable({
  providedIn: 'root',
})
export class ProjetosFormService {
  private _projetoForm!: FormGroup<ProjetoFormModel>;

  get form() {
    return this._projetoForm;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {}

  public buildProjetoForm(
    projetoFormModel: ProjetoFormModel
  ): FormGroup<ProjetoFormModel> {
    const projetoForm = this._nnfb.group<ProjetoFormModel>(projetoFormModel);

    projetoForm
      .get('sigla')
      ?.addValidators([Validators.required, Validators.maxLength(12)]);
    projetoForm
      .get('titulo')
      ?.addValidators([Validators.required, Validators.maxLength(150)]);
    projetoForm.get('idOrganizacao')?.addValidators(Validators.required);
    projetoForm
      .get('valorEstimado')
      ?.addValidators([Validators.required, Validators.min(1)]);
    projetoForm.get('idMicrorregioes')?.addValidators(Validators.required);
    projetoForm
      .get('objetivo')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('objetivoEspecifico')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('situacaoProblema')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('solucoesPropostas')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('impactos')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('arranjosInstitucionais')
      ?.addValidators([Validators.required, Validators.maxLength(2000)]);
    projetoForm
      .get('idResponsavelProponente')
      ?.addValidators(Validators.required);
    projetoForm
      .get('equipeElaboracao')
      ?.addValidators([Validators.required, Validators.minLength(1)]);

    this._projetoForm = projetoForm;
    return projetoForm;
  }

  public getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  get sigla(): FormControl<string | null> {
    return this.form.get('sigla') as FormControl<string | null>;
  }

  get titulo(): FormControl<string | null> {
    return this.form.get('titulo') as FormControl<string | null>;
  }

  get idOrganizacao(): FormControl<number | null> {
    return this.form.get('idOrganizacao') as FormControl<number | null>;
  }

  get valorEstimado(): FormControl<number | null> {
    return this.form.get('valorEstimado') as FormControl<number | null>;
  }

  get idMicrorregioes(): FormControl<number[] | null> {
    return this.form.get('idMicrorregioes') as FormControl<number[] | null>;
  }

  get objetivo(): FormControl<string | null> {
    return this.form.get('objetivo') as FormControl<string | null>;
  }

  get objetivoEspecifico(): FormControl<string | null> {
    return this.form.get('objetivoEspecifico') as FormControl<string | null>;
  }

  get situacaoProblema(): FormControl<string | null> {
    return this.form.get('situacaoProblema') as FormControl<string | null>;
  }

  get solucoesPropostas(): FormControl<string | null> {
    return this.form.get('solucoesPropostas') as FormControl<string | null>;
  }

  get impactos(): FormControl<string | null> {
    return this.form.get('impactos') as FormControl<string | null>;
  }

  get arranjosInstitucionais(): FormControl<string | null> {
    return this.form.get('arranjosInstitucionais') as FormControl<
      string | null
    >;
  }

  get idResponsavelProponente(): FormControl<number | null> {
    return this.form.get('idResponsavelProponente') as FormControl<
      number | null
    >;
  }

  get equipeElaboracao(): FormArray<FormGroup<EquipeFormModel>> {
    return this.form.get('equipeElaboracao') as FormArray<
      FormGroup<EquipeFormModel>
    >;
  }

  public buildMemberFormGroup(
    idPessoa?: number,
    idPapel?: number
  ): FormGroup<EquipeFormModel> {
    return this._nnfb.group<EquipeFormModel>({
      idPessoa: this._nnfb.control<number | null>(
        idPessoa ?? null,
        Validators.required
      ),
      idPapel: this._nnfb.control<number | null>(
        idPapel ?? null,
        Validators.required
      ),
      idStatus: this._nnfb.control<number | null>(1, Validators.required),
      justificativa: this._nnfb.control<string | null>(null),
    });
  }
}
