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
import { IProposta } from '../../../core/interfaces/propostas.interface';
import { PropostaFormModel } from '../../../core/models/proposta.model';
import { PropostasService } from '../../../core/services/propostas/propostas.service';

@Component({
  selector: 'siscap-proposta-form',
  standalone: false,
  templateUrl: './proposta-form.component.html',
  styleUrl: './proposta-form.component.scss',
})
export class PropostaFormComponent implements OnInit, OnDestroy {
  private readonly _atualizarProposta$: Observable<IProjeto>;
  private readonly _cadastrarProposta$: Observable<number>;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getLocalidadesOpcoes$: Observable<
    ILocalidadeOpcoesDropdown[]
  >;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idPropostaEdicao: number = 0;

  private readonly _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;
  public mostrarBotaoGerarDic: boolean = false;

  public propostaForm: FormGroup = new FormGroup({});

  public organizacoesOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoesFilrada: IOpcoesDropdown[] = [];
  public microrregioesOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];

  public idMembroEquipeElaboracao: number | null = null;

  constructor(
    private readonly _router: Router,
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _projetosService: ProjetosService,
    private readonly _propostasService: PropostasService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _pessoasService: PessoasService,
    public equipeService: EquipeService,
    private readonly _toastService: ToastService,
    private readonly _breadcrumbService: BreadcrumbService
  ) {
    const [editar$, criar$] = partition(
      this._projetosService.idProjeto$,
      (idProjeto: number) => idProjeto > 0
    );

    this._atualizarProposta$ = editar$.pipe(
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
        const propostaModel =
          this._propostasService.converterProjetoModelParaPropostaModel(
            projetoModel
          );

        this.iniciarForm(propostaModel);

        this._idPropostaEdicao = propostaModel.id;

        this.mostrarBotaoGerarDic = true;

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarProposta$ = criar$.pipe(
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

    this._getLocalidadesOpcoes$ = this._opcoesDropdownService
      .getOpcoesLocalidades()
      .pipe(
        tap((response) => {
          const microrregioesOpcoes: IOpcoesDropdown[] = [
            { id: 1, nome: 'Todo o Estado' },
          ];

          this.microrregioesOpcoes = microrregioesOpcoes.concat(
            response.filter((localidade) => localidade.tipo == 'Microrregiao')
          );
        })
      );

    this._getTiposPapelOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposPapel()
      .pipe(tap((response) => (this.tiposPapelOpcoes = response)));

    this._getAllOpcoes$ = concat(
      this._getOrganizacoesOpcoes$,
      this._getPessoasOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getLocalidadesOpcoes$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

    this._subscription.add(this._atualizarProposta$.subscribe());
    this._subscription.add(this._cadastrarProposta$.subscribe());
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
    return this.propostaForm.get(controlName) as AbstractControl<any, any>;
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

  public microrregioesNgSelectAddEvent(event: number): void {
    const idMicrorregioesListFormControl = this.getControl(
      'idMicrorregioesList'
    ) as FormControl<Array<number>>;

    if (event == 1) {
      idMicrorregioesListFormControl.patchValue([1]);
    }
  }

  public travarMicrorregiaoOpcao(idMicrorregiao: number): boolean {
    const idMicrorregioesListFormControl = this.getControl(
      'idMicrorregioesList'
    ) as FormControl<Array<number>>;

    return (
      idMicrorregioesListFormControl.value?.includes(1) && idMicrorregiao != 1
    );
  }

  public baixarDIC(): void {
    this._projetosService.baixarDIC(this._idPropostaEdicao);
  }

  private iniciarForm(propostaFormModel?: PropostaFormModel): void {
    this.propostaForm = this._nnfb.group({
      sigla: this._nnfb.control(propostaFormModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(propostaFormModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idOrganizacao: this._nnfb.control(
        propostaFormModel?.idOrganizacao ?? null,
        Validators.required
      ),
      valorEstimado: this._nnfb.control(
        propostaFormModel?.valorEstimado ?? null,
        [Validators.required, Validators.min(1)]
      ),
      idMicrorregioesList: this._nnfb.control(
        propostaFormModel?.idMicrorregioesList ?? null,
        [Validators.required, Validators.minLength(1)]
      ),
      objetivo: this._nnfb.control(propostaFormModel?.objetivo ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      objetivoEspecifico: this._nnfb.control(
        propostaFormModel?.objetivoEspecifico ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      situacaoProblema: this._nnfb.control(
        propostaFormModel?.situacaoProblema ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      solucoesPropostas: this._nnfb.control(
        propostaFormModel?.solucoesPropostas ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      impactos: this._nnfb.control(propostaFormModel?.impactos ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      arranjosInstitucionais: this._nnfb.control(
        propostaFormModel?.arranjosInstitucionais ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      idResponsavelProponente: this._nnfb.control(
        propostaFormModel?.idResponsavelProponente ?? null,
        Validators.required
      ),
      equipeElaboracao: this.equipeService.construirEquipeFormArray(
        propostaFormModel?.equipeElaboracao
      ),
    });

    this.propostaFormValueChanges();
  }

  private propostaFormValueChanges(): void {
    const idOrganizacaoFormControl = this.propostaForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.propostaForm.get(
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

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {
    const idResponsavelProponenteFormControl = this.propostaForm.get(
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
        this.submitPropostaForm(this.propostaForm, true);
        break;

      case 'enviar':
        this.submitPropostaForm(this.propostaForm, false);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const propostaFormControls = this.propostaForm.controls;

    alterarEstadoControlesFormulario(permitir, propostaFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'propostas']);
  }

  private submitPropostaForm(form: FormGroup, isRascunho: boolean): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const propostaPayload = new PropostaFormModel(form.value as IProposta);

    const projetoPayload =
      this._propostasService.converterPropostaFormModelParaProjetoFormModel(
        propostaPayload
      );

    console.log(propostaPayload);
    console.log(projetoPayload);
    console.log(isRascunho);

    // const requisicao = this._idPropostaEdicao
    //   ? this.atualizarProjeto(payload)
    //   : this.cadastrarProjeto(payload);

    // requisicao.subscribe();
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
    return this._projetosService.put(this._idPropostaEdicao, payload).pipe(
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
    this._projetosService.idProjeto$.next(0);
  }
}
