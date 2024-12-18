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
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import {
  ProjetoFormModel,
  ProjetoModel,
} from '../../../core/models/projeto.model';

import {
  ILocalidadeOpcoesDropdown,
  IOpcoesDropdown,
} from '../../../core/interfaces/opcoes-dropdown.interface';
import {
  IProjeto,
  IProjetoForm,
} from '../../../core/interfaces/projeto.interface';
import { IMoeda } from '../../../core/interfaces/moeda.interface';

import { ValorFormType } from '../../../core/types/form/valor-form.type';

import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';
import { MoedaHelper } from '../../../core/helpers/moeda.helper';
import { TipoValorEnum } from '../../../core/enums/tipo-valor.enum';

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss',
})
export class ProjetoFormComponent implements OnInit, OnDestroy {
  private readonly _atualizarProjeto$: Observable<IProjeto>;
  private readonly _cadastrarProjeto$: Observable<number>;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPlanosOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getLocalidadesOpcoes$: Observable<
    ILocalidadeOpcoesDropdown[]
  >;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idProjetoEdicao: number = 0;

  private readonly _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;
  public mostrarBotaoGerarDic: boolean = false;

  public projetoForm: FormGroup = new FormGroup({});

  public organizacoesOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoesFilrada: IOpcoesDropdown[] = [];
  public planosOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];
  public localidadesOpcoes: ILocalidadeOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeElaboracao: number | null = null;

  constructor(
    private readonly _router: Router,
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _projetosService: ProjetosService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _pessoasService: PessoasService,
    public equipeService: EquipeService,
    private readonly _valorService: ValorService,
    private readonly _rateioService: RateioService,
    private readonly _toastService: ToastService,
    private readonly _breadcrumbService: BreadcrumbService
  ) {
    const [editar$, criar$] = partition(
      this._projetosService.idProjeto$,
      (idProjeto: number) => idProjeto > 0
    );

    this._atualizarProjeto$ = editar$.pipe(
      switchMap((idProjeto: number) =>
        this._projetosService
          .getById(idProjeto)
          .pipe(
            map<IProjeto, ProjetoModel>(
              (response: IProjeto) => new ProjetoModel(response)
            )
          )
      ),
      tap((projetoModel: ProjetoModel) => {
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

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
      .pipe(tap((response) => (this.organizacoesOpcoes = response)));

    this._getPessoasOpcoes$ = this._opcoesDropdownService
      .getOpcoesPessoas()
      .pipe(
        tap(
          (response) =>
            (this.pessoasOpcoesFilrada = this.pessoasOpcoes = response)
        )
      );

    this._getPlanosOpcoes$ = this._opcoesDropdownService
      .getOpcoesPlanos()
      .pipe(tap((response) => (this.planosOpcoes = response)));

    this._getTiposValorOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposValor()
      .pipe(tap((response) => (this.tiposValorOpcoes = response)));

    this._getLocalidadesOpcoes$ = this._opcoesDropdownService
      .getOpcoesLocalidades()
      .pipe(tap((response) => (this.localidadesOpcoes = response)));

    this._getTiposPapelOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposPapel()
      .pipe(tap((response) => (this.tiposPapelOpcoes = response)));

    this._getAllOpcoes$ = concat(
      this._getOrganizacoesOpcoes$,
      this._getPessoasOpcoes$,
      this._getPlanosOpcoes$,
      this._getTiposValorOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getLocalidadesOpcoes$
    ).pipe(
      finalize(
        () => (this._rateioService.localidadesOpcoes = this.localidadesOpcoes)
      )
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

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
    pessoasOpcoes: IOpcoesDropdown[]
  ): IOpcoesDropdown[] {
    return pessoasOpcoes.filter(
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
      valor: this._valorService.construirValorFormGroup(
        projetoFormModel?.valor
      ),
      rateio: this._rateioService.construirRateioFormArray(
        projetoFormModel?.rateio
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
    this.valorFormValueChanges();
  }

  private projetoFormValueChanges(): void {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    idOrganizacaoFormControl.valueChanges.subscribe((idOrganizacaoValue) => {
      if (this.isModoEdicao && !idResponsavelProponenteFormControl.value)
        this.idOrganizacaoChange(idOrganizacaoValue);
    });

    idResponsavelProponenteFormControl.valueChanges.subscribe(
      (idResponsavelProponenteValue) => {
        const isEquipePossuiIdResponsavelProponente =
          this.equipeService.equipeFormArray.value.some(
            (membro) => membro.idPessoa === idResponsavelProponenteValue
          );

        if (
          this.equipeService.equipeFormArray.length > 0 &&
          idResponsavelProponenteFormControl.dirty &&
          isEquipePossuiIdResponsavelProponente
        ) {
          this._toastService.showToast(
            'info',
            'Responsável proponente já incluso na equipe',
            ['Limpando membros da equipe.']
          );

          this.equipeService.equipeFormArray.clear();
        }
      }
    );
  }

  private valorFormValueChanges(): void {
    const valorFormGroup = this.projetoForm.get(
      'valor'
    ) as FormGroup<ValorFormType>;

    const tipoFormControl = valorFormGroup.get('tipo') as FormControl<
      number | null
    >;
    const moedaFormControl = valorFormGroup.get('moeda') as FormControl<
      string | null
    >;
    const quantiaFormControl = valorFormGroup.get('quantia') as FormControl<
      number | null
    >;

    // Inicializa moeda com tipo 'BRL' [Localizar lógica no serviço]
    if (!moedaFormControl.value) {
      moedaFormControl.patchValue('BRL');
      this._rateioService.moedaFormControlReferencia$.next(
        moedaFormControl.value
      );
    }

    if (!tipoFormControl.value) {
      // Caso específico de Projetos; tipo do valor somente pode ser 'Estimado'
      tipoFormControl.patchValue(TipoValorEnum.Estimado);
      tipoFormControl.disable();
    }

    moedaFormControl.valueChanges.subscribe((moedaValue) => {
      this._rateioService.moedaFormControlReferencia$.next(moedaValue);
    });

    quantiaFormControl.valueChanges.subscribe((quantiaValue) => {
      this._rateioService.quantiaFormControlReferencia$.next(quantiaValue);
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
        next: (response: IOpcoesDropdown) => {
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

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    this.projetoForm.get('valor.tipo')?.disable();
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

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    form.get('valor.tipo')?.enable();

    const payload = new ProjetoFormModel(form.value as IProjetoForm);

    const requisicao = this._idProjetoEdicao
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
    this._rateioService.resetarRateio();
    this._projetosService.idProjeto$.next(0);
  }
}
