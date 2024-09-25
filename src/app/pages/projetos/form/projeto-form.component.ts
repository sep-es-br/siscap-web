import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
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

import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { SelectListService } from '../../../core/services/select-list/select-list.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import {
  ProjetoFormModel,
  ProjetoModel,
} from '../../../core/models/projeto.model';

import {
  ICidadeSelectList,
  ISelectList,
} from '../../../core/interfaces/select-list.interface';
import {
  IProjeto,
  IProjetoForm,
} from '../../../core/interfaces/projeto.interface';

import { RateioFormType } from '../../../core/types/form/rateio-form.type';

import { construirMicrorregioesCidadesMapObject } from '../../../core/helpers/microrregioes-cidades-map-object.helper';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { rateioValidator } from '../../../core/validators/rateio.validator';
import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss',
})
export class ProjetoFormComponent implements OnInit, OnDestroy {
  private _atualizarProjeto$: Observable<IProjeto>;
  private _cadastrarProjeto$: Observable<number>;

  private _getOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getPessoasSelectList$: Observable<ISelectList[]>;
  private _getPlanosSelectList$: Observable<ISelectList[]>;
  private _getMicrorregioesSelectList$: Observable<ISelectList[]>;
  private _getCidadesComMicrorregiaoSelectList$: Observable<
    ICidadeSelectList[]
  >;
  private _getPapeisSelectList$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _idProjetoEdicao: number = 0;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;
  public mostrarBotaoGerarDic: boolean = false;

  public projetoForm: FormGroup = new FormGroup({});

  public organizacoesSelectList: ISelectList[] = [];
  public pessoasSelectList: ISelectList[] = [];
  public pessoasSelectListFilrada: ISelectList[] = [];
  public planosSelectList: ISelectList[] = [];
  public microrregioesSelectList: ISelectList[] = [];
  public cidadesComMicrorregiaoSelectList: ICidadeSelectList[] = [];
  public papeisSelectList: ISelectList[] = [];

  public idMembroEquipeElaboracao: number | null = null;

  constructor(
    private _router: Router,
    private _nnfb: NonNullableFormBuilder,
    private _projetosService: ProjetosService,
    public equipeService: EquipeService,
    private _rateioService: RateioService,
    private _selectListService: SelectListService,
    private _pessoasService: PessoasService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    const [editar$, criar$] = partition(
      this._projetosService.idProjeto$,
      (idProjeto: number) => idProjeto > 0
    );

    this._atualizarProjeto$ = editar$.pipe(
      switchMap((idProjeto: number) =>
        this._projetosService.getById(idProjeto)
      ),
      tap((response: IProjeto) => {
        const projetoModel = new ProjetoModel(response);

        this.iniciarForm(projetoModel);

        this._idProjetoEdicao = projetoModel.id;

        this.mostrarBotaoGerarDic = true;

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarProjeto$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.mostrarBotaoGerarDic = false;

        this.loading = false;
      })
    );

    this._getOrganizacoesSelectList$ = this._selectListService
      .getOrganizacoes()
      .pipe(tap((response) => (this.organizacoesSelectList = response)));

    this._getPessoasSelectList$ = this._selectListService
      .getPessoas()
      .pipe(
        tap(
          (response) =>
            (this.pessoasSelectListFilrada = this.pessoasSelectList = response)
        )
      );

    this._getPlanosSelectList$ = this._selectListService
      .getPlanos()
      .pipe(tap((response) => (this.planosSelectList = response)));

    this._getMicrorregioesSelectList$ = this._selectListService
      .getMicrorregioes()
      .pipe(tap((response) => (this.microrregioesSelectList = response)));

    this._getCidadesComMicrorregiaoSelectList$ = this._selectListService
      .getCidadesComMicrorregiao()
      .pipe(
        tap((response) => (this.cidadesComMicrorregiaoSelectList = response))
      );

    this._getPapeisSelectList$ = this._selectListService
      .getPapeis()
      .pipe(tap((response) => (this.papeisSelectList = response)));

    this._getAllSelectLists$ = concat(
      this._getOrganizacoesSelectList$,
      this._getPessoasSelectList$,
      this._getPlanosSelectList$,
      this._getPapeisSelectList$,
      this._getMicrorregioesSelectList$,
      this._getCidadesComMicrorregiaoSelectList$
    ).pipe(
      finalize(() => {
        this._rateioService.microrregioesCidadesMapObject =
          construirMicrorregioesCidadesMapObject(
            this.microrregioesSelectList,
            this.cidadesComMicrorregiaoSelectList
          );
      })
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    this._subscription.add(this._atualizarProjeto$.subscribe());
    this._subscription.add(this._cadastrarProjeto$.subscribe());
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.projetoForm.get(controlName) as AbstractControl<any, any>;
  }

  public filtrarResponsavelProponente(
    pessoasSelectList: ISelectList[]
  ): ISelectList[] {
    return pessoasSelectList.filter(
      (pessoa) => pessoa.id != this.getControl('idResponsavelProponente').value
    );
  }

  public idMembroNgSelectChangeEvent(event: number): void {
    this.equipeService.idMembroNgSelectValue$.next(event);

    setTimeout(() => (this.idMembroEquipeElaboracao = null), 0);
  }

  public baixarDIC(): void {
    this._projetosService.baixarDIC(this._idProjetoEdicao);
  }

  private iniciarForm(projetoFormModel?: ProjetoFormModel): void {
    this.projetoForm = this._nnfb.group({
      sigla: this._nnfb.control(projetoFormModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(projetoFormModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idOrganizacao: this._nnfb.control(
        projetoFormModel?.idOrganizacao ?? null,
        Validators.required
      ),
      valorEstimado: this._nnfb.control(
        projetoFormModel?.valorEstimado ?? null,
        [Validators.required, Validators.min(1)]
      ),
      rateio: this._nnfb.group(
        {
          rateioMicrorregiao:
            this._rateioService.construirRateioMicrorregiaoFormArray(
              projetoFormModel?.rateio.rateioMicrorregiao
            ),
          rateioCidade: this._rateioService.construirRateioCidadeFormArray(
            projetoFormModel?.rateio.rateioCidade
          ),
        },
        { validators: Validators.required }
      ),
      objetivo: this._nnfb.control(projetoFormModel?.objetivo ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      objetivoEspecifico: this._nnfb.control(
        projetoFormModel?.objetivoEspecifico ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      situacaoProblema: this._nnfb.control(
        projetoFormModel?.situacaoProblema ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      solucoesPropostas: this._nnfb.control(
        projetoFormModel?.solucoesPropostas ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      impactos: this._nnfb.control(projetoFormModel?.impactos ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      arranjosInstitucionais: this._nnfb.control(
        projetoFormModel?.arranjosInstitucionais ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      idResponsavelProponente: this._nnfb.control(
        projetoFormModel?.idResponsavelProponente ?? null,
        Validators.required
      ),
      equipeElaboracao: this.equipeService.construirEquipeFormArray(
        projetoFormModel?.equipeElaboracao
      ),
    });

    this.projetoFormValueChanges();
  }

  private projetoFormValueChanges(): void {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    const valorEstimadoFormControl = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number | null>;

    const rateioFormGroup = this.projetoForm.get(
      'rateio'
    ) as FormGroup<RateioFormType>;

    idOrganizacaoFormControl.valueChanges.subscribe((idOrganizacaoValue) => {
      if (this.isModoEdicao) this.idOrganizacaoChange(idOrganizacaoValue);
    });

    idResponsavelProponenteFormControl.valueChanges.subscribe(
      (idResponsavelProponenteValue) => {
        if (
          this.equipeService.equipeFormArray.length > 0 &&
          idResponsavelProponenteFormControl.dirty
        ) {
          this._toastService.showToast(
            'info',
            'Responsável proponente alterado',
            ['Limpando membros da equipe']
          );

          this.equipeService.equipeFormArray.clear();
        }
      }
    );

    valorEstimadoFormControl.valueChanges.subscribe((valorEstimadoValue) => {
      this._rateioService.valorEstimadoReferencia$.next(valorEstimadoValue);

      rateioFormGroup.setErrors(
        rateioValidator(valorEstimadoValue, rateioFormGroup.value)
      );
    });

    rateioFormGroup.valueChanges.subscribe((rateioFormGroupValue) => {
      rateioFormGroup.setErrors(
        rateioValidator(valorEstimadoFormControl.value, rateioFormGroupValue)
      );
    });
  }

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {
    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    if (!idOrganizacaoValue) {
      idResponsavelProponenteFormControl.patchValue(null);
      return;
    }

    this._pessoasService
      .buscarResponsavelPorIdOrganizacao(idOrganizacaoValue)
      .subscribe({
        next: (response: ISelectList) => {
          idResponsavelProponenteFormControl.patchValue(response.id);
        },
        error: (err) => {
          idResponsavelProponenteFormControl.patchValue(null);
          idResponsavelProponenteFormControl.markAsTouched();
        },
      });
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
        this.submitProjetoForm(this.projetoForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const projetoFormControls = this.projetoForm.controls;

    alterarEstadoControlesFormulario(permitir, projetoFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'projetos']);
  }

  private submitProjetoForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    if (
      !this._rateioService.checarConsistenciaMicrorregioesCidades(
        form.value.rateio
      )
    ) {
      this._toastService.showToast(
        'warning',
        'O formulário contém erros.',
        [
          'Certifique-se de que toda microrregião inclusa no rateio possua ao menos uma cidade a ela pertencente inclusa no rateio.',
          'Certifique-se de que, para as cidades inclusas no rateio, a microrregião a qual estas pertencem está inclusa no rateio.',
        ],
        10000
      );
      return;
    }

    const payload = new ProjetoFormModel(form.value as IProjetoForm);

    const requisicao = !!this._idProjetoEdicao
      ? this.atualizarProjeto(payload)
      : this.cadastrarProjeto(payload);

    requisicao.subscribe();
  }

  private cadastrarProjeto(payload: ProjetoFormModel): Observable<IProjeto> {
    return this._projetosService.post(payload).pipe(
      tap((response: IProjeto) => {
        this._toastService.showToast(
          'success',
          'Projeto cadastrado com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  private atualizarProjeto(payload: ProjetoFormModel): Observable<IProjeto> {
    return this._projetosService.put(this._idProjetoEdicao, payload).pipe(
      tap((response: IProjeto) => {
        this._toastService.showToast(
          'success',
          'Projeto alterado com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._rateioService.limparTotalRateio();
    this._projetosService.idProjeto$.next(0);
  }
}
