import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  concat,
  finalize,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { SelectListService } from '../../../core/services/select-list/select-list.service';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  ProgramaFormModel,
  ProgramaModel,
} from '../../../core/models/programa.model';

import {
  IPrograma,
  IProgramaForm,
  IProgramaProjetoProposto,
} from '../../../core/interfaces/programa.interface';
import {
  IProjetoPropostoSelectList,
  ISelectList,
} from '../../../core/interfaces/select-list.interface';
import { IMoeda } from '../../../core/interfaces/moeda.interface';

import { ProgramaProjetoPropostoFormType } from '../../../core/types/form/programa-projeto-proposto-form.type';

import { MoedaHelper } from '../../../core/helpers/moeda.helper';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';

@Component({
  selector: 'siscap-programa-form',
  standalone: false,
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.scss',
})
export class ProgramaFormComponent implements OnInit, OnDestroy {
  private _atualizarPrograma$: Observable<IPrograma>;
  private _cadastrarPrograma$: Observable<number>;

  private _getOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getPessoasSelectList$: Observable<ISelectList[]>;
  private _getPapeisSelectList$: Observable<ISelectList[]>;
  private _getProjetosPropostosSelectList$: Observable<
    IProjetoPropostoSelectList[]
  >;
  private _getTiposValoresSelectList$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _idProgramaEdicao: number = 0;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public programaForm: FormGroup = new FormGroup({});

  public organizacoesSelectList: ISelectList[] = [];
  public pessoasSelectList: ISelectList[] = [];
  public papeisSelectList: ISelectList[] = [];
  public projetosPropostosSelectList: IProjetoPropostoSelectList[] = [];
  public tiposValoresSelectList: ISelectList[] = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeCaptacao: number | null = null;
  public idProjetoProposto: number | null = null;

  constructor(
    private _router: Router,
    private _nnfb: NonNullableFormBuilder,
    public equipeService: EquipeService,
    private _programasService: ProgramasService,
    private _valorService: ValorService,
    private _selectListService: SelectListService,
    private _breadcrumbService: BreadcrumbService,
    private _toastService: ToastService
  ) {
    const [editar$, criar$] = partition(
      this._programasService.idPrograma$,
      (idPrograma: number) => idPrograma > 0
    );

    this._atualizarPrograma$ = editar$.pipe(
      switchMap((idPrograma: number) =>
        this._programasService.getById(idPrograma)
      ),
      tap((response: IPrograma) => {
        const programaModel = new ProgramaModel(response);

        this.iniciarForm(programaModel);

        this._idProgramaEdicao = programaModel.id;

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarPrograma$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.loading = false;
      })
    );

    this._getOrganizacoesSelectList$ = this._selectListService
      .getOrganizacoes(TipoOrganizacaoEnum.Secretaria)
      .pipe(
        tap(
          (response: ISelectList[]) => (this.organizacoesSelectList = response)
        )
      );

    this._getPessoasSelectList$ = this._selectListService
      .getPessoas()
      .pipe(
        tap((response: ISelectList[]) => (this.pessoasSelectList = response))
      );

    this._getPapeisSelectList$ = this._selectListService
      .getPapeis()
      .pipe(
        tap((response: ISelectList[]) => (this.papeisSelectList = response))
      );

    this._getProjetosPropostosSelectList$ = this._selectListService
      .getProjetosPropostos()
      .pipe(
        tap(
          (response: IProjetoPropostoSelectList[]) =>
            (this.projetosPropostosSelectList = response)
        )
      );

    // 07/10/2024 - Somente exibir tipos de valor 'Estimado', 'Em captação' e 'Captado'
    this._getTiposValoresSelectList$ = this._selectListService
      .getTiposValores()
      .pipe(
        tap(
          (response: ISelectList[]) =>
            (this.tiposValoresSelectList = response.filter(
              (tipoValor) => tipoValor.id <= 3
            ))
        )
      );

    this._getAllSelectLists$ = concat(
      this._getOrganizacoesSelectList$,
      this._getPessoasSelectList$,
      this._getPapeisSelectList$,
      this._getProjetosPropostosSelectList$,
      this._getTiposValoresSelectList$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    this._subscription.add(this._atualizarPrograma$.subscribe());
    this._subscription.add(this._cadastrarPrograma$.subscribe());
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.programaForm.get(controlName) as AbstractControl<any, any>;
  }

  public get projetosPropostos(): FormArray<
    FormGroup<ProgramaProjetoPropostoFormType>
  > {
    return this.programaForm.get('projetosPropostos') as FormArray<
      FormGroup<ProgramaProjetoPropostoFormType>
    >;
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public idMembroNgSelectChangeEvent(event: number): void {
    this.equipeService.idMembroNgSelectValue$.next(event);

    setTimeout(() => (this.idMembroEquipeCaptacao = null), 0);
  }

  public idProjetoPropostoNgSelectChangeEvent(event: number): void {
    this.incluirProjetoPropostoNoPrograma(
      this.construirProjetoPropostoFormGroupNgSelectValue(event)
    );

    setTimeout(() => (this.idProjetoProposto = null), 0);
  }

  public getProjetoPropostoNome(idProjetoProposto?: number): string {
    return (
      this.projetosPropostosSelectList.find(
        (projetoPropostoSelectItem) =>
          projetoPropostoSelectItem.id === idProjetoProposto
      )?.nome ?? ''
    );
  }

  public filtrarProjetosSelectList(
    projetosPropostosSelectList: IProjetoPropostoSelectList[]
  ): IProjetoPropostoSelectList[] {
    return projetosPropostosSelectList.filter(
      (projetoPropostoSelectItem) =>
        !this.projetosPropostos.value.some(
          (projetoProposto) =>
            projetoProposto.idProjeto === projetoPropostoSelectItem.id
        )
    );
  }

  private iniciarForm(programaModel?: ProgramaFormModel): void {
    this.programaForm = this._nnfb.group({
      sigla: this._nnfb.control(programaModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(programaModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idOrgaoExecutorList: this._nnfb.control(
        programaModel?.idOrgaoExecutorList ?? [],
        [Validators.required, Validators.min(1)]
      ),
      equipeCaptacao: this.equipeService.construirEquipeFormArray(
        programaModel?.equipeCaptacao
      ),
      projetosPropostos: this.construirProjetosPropostosFormArray(
        programaModel?.projetosPropostos
      ),
      valor: this._valorService.construirValorFormGroup(programaModel?.valor),
    });

    this.programaFormValueChanges();
  }

  private construirProjetosPropostosFormArray(
    projetosPropostos?: Array<IProgramaProjetoProposto>
  ): FormArray<FormGroup<ProgramaProjetoPropostoFormType>> {
    const projetosPropostosFormArray = this._nnfb.array<
      FormGroup<ProgramaProjetoPropostoFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (projetosPropostos) {
      projetosPropostos.forEach((projetoProposto) => {
        projetosPropostosFormArray.push(
          this.construirProjetoPropostoFormGroup(projetoProposto)
        );
      });
    }

    return projetosPropostosFormArray;
  }

  private construirProjetoPropostoFormGroup(
    projetoProposto?: IProgramaProjetoProposto
  ): FormGroup<ProgramaProjetoPropostoFormType> {
    return this._nnfb.group({
      idProjeto: this._nnfb.control(
        projetoProposto?.idProjeto ?? 0,
        Validators.required
      ),
      valor: this._nnfb.control(projetoProposto?.valor ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  private construirProjetoPropostoFormGroupNgSelectValue(
    ngSelectValue: number
  ): FormGroup<ProgramaProjetoPropostoFormType> {
    const projetoPropostoFormGroup = this.construirProjetoPropostoFormGroup();

    const projetoPropostoValorEstimado =
      this.projetosPropostosSelectList.find(
        (projetoPropostoSelectItem) =>
          projetoPropostoSelectItem.id === ngSelectValue
      )?.valorEstimado ?? null;

    projetoPropostoFormGroup.patchValue({ idProjeto: ngSelectValue });
    projetoPropostoFormGroup.patchValue({
      valor: projetoPropostoValorEstimado,
    });
    return projetoPropostoFormGroup;
  }

  private incluirProjetoPropostoNoPrograma(
    projetoPropostoFormGroup: FormGroup<ProgramaProjetoPropostoFormType>
  ): void {
    this.projetosPropostos.push(projetoPropostoFormGroup);
  }

  public removerProjetoPropostoDoPrograma(index: number): void {
    this.projetosPropostos.removeAt(index);
  }

  private programaFormValueChanges(): void {
    const projetosPropostosFormArray = this.projetosPropostos;

    const valorFormGroupQuantiaFormControl = this.programaForm.get(
      'valor.quantia'
    ) as FormControl<number | null>;

    projetosPropostosFormArray.valueChanges.subscribe(
      (projetosPropostosValue) => {
        const somatorioValorProjetosPropostos = projetosPropostosValue.reduce(
          (acc, projetoProposto) => acc + (projetoProposto?.valor ?? 0),
          0
        );

        if (this.isModoEdicao) {
          valorFormGroupQuantiaFormControl.patchValue(
            somatorioValorProjetosPropostos
              ? somatorioValorProjetosPropostos
              : null
          );
        }
      }
    );
  }

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this.trocarModo(true);
        break;

      case 'cancelar':
        this.cancelar();
        break;

      case 'salvar':
        this.submitProgramaForm(this.programaForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const programaFormControls = this.programaForm.controls;

    alterarEstadoControlesFormulario(permitir, programaFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'programas']);
  }

  private submitProgramaForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new ProgramaFormModel(form.value as IProgramaForm);

    const requisicao = this._idProgramaEdicao
      ? this.atualizarPrograma(payload)
      : this.cadastrarPrograma(payload);

    requisicao.subscribe();
  }

  private cadastrarPrograma(payload: ProgramaFormModel): Observable<IPrograma> {
    return this._programasService.post(payload).pipe(
      tap((response: IPrograma) => {
        this._toastService.showToast(
          'success',
          'Programa cadastrado com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  private atualizarPrograma(payload: ProgramaFormModel): Observable<IPrograma> {
    return this._programasService.put(this._idProgramaEdicao, payload).pipe(
      tap((response: IPrograma) => {
        this._toastService.showToast(
          'success',
          'Programa alterado com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._programasService.idPrograma$.next(0);
  }
}
