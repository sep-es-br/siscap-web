import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import {
  concat,
  finalize,
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
  EMPTY,
  catchError
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import {
  ProjetoFormModel,
  ProjetoModel,
} from '../../../core/models/projeto.model';
import { RateioModel } from '../../../core/models/rateio.model';
import { ValorModel } from '../../../core/models/valor.model';

import {
  ILocalidadeOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownResponsavelProponente,
} from '../../../core/interfaces/opcoes-dropdown.interface';
import {
  IProjeto,
  IProjetoForm,
} from '../../../core/interfaces/projeto.interface';
import { IMoeda } from '../../../core/interfaces/moeda.interface';

import { ValorFormType } from '../../../core/types/form/valor-form.type';
import { TBotaoAcao } from '../../../shared/components/botao/botao.config';

import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';
import { MoedaHelper } from '../../../core/helpers/moeda.helper';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';
import { TipoValorEnum } from '../../../core/enums/tipo-valor.enum';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss',
})
export class ProjetoFormComponent implements OnInit, OnDestroy {
  private readonly _subscription: Subscription = new Subscription();

  private readonly _atualizarProjeto$: Observable<IProjeto>;
  private readonly _cadastrarProjeto$: Observable<number>;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPlanosOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getLocalidadesOpcoes$: Observable<ILocalidadeOpcoesDropdown[]>;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposIndicadoresOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idProjetoEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = true;
  public mostrarBotaoGerarDic: boolean = false;
  public mostrarBotaoStatusProjeto: boolean = false;
  public isProponente: boolean = false;
  public usuario_IdOrganizacoes: Array<number> = [];

  public projetoForm: FormGroup = new FormGroup({});
  public projetoTooltip: Record<string, string> =
    COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public organizacoesOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoes: IOpcoesDropdownResponsavelProponente[] = [];
  public pessoasOpcoesFiltrada: IOpcoesDropdownResponsavelProponente[] = [];
  public planosOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];
  public localidadesOpcoes: ILocalidadeOpcoesDropdown[] = [];
  public microrregioesOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];

  public indicadoresOpcoes: IOpcoesDropdown[] = [];

  public statusProjeto: string = '';
  public statusProjetoNovo: string | null = null;
  public statusProjetoOpcoes: Array<string> = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeElaboracao:  | null = null;

  public idIndicadorIndicadores:  | null = null;

  public isLoadingPessoas = true;

  constructor(
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _usuarioService: UsuarioService,
    private readonly _projetosService: ProjetosService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _pessoasService: PessoasService,
    public equipeService: EquipeService,
    private readonly _valorService: ValorService,
    private readonly _rateioService: RateioService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _navegacaoService: NavegacaoService,
    public indicadoresService: IndicadoresService
  ) {

    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
    this.usuario_IdOrganizacoes =
      this._usuarioService.usuarioPerfil.idOrganizacoes;

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
            ),
            catchError((error) => {
              // Exibe mensagem de erro para o usuário
              this._toastService.showToast(
                'error',
                'Erro ao carregar projeto',
                ['Verifique se o projeto está válido.']
              );
              // Finaliza os spinners
              this.loading = false;
              this.isLoadingPessoas = false;
              // Retorna um Observable vazio para não quebrar o fluxo
              return EMPTY;
            })
          )
      ),
      tap((projetoModel: ProjetoModel) => {
        this.statusProjeto = projetoModel.status;
        this.statusProjetoOpcoes = Object.values(StatusProjetoEnum).filter(
          (status) => status != this.statusProjeto
        );
        
        this.iniciarForm(projetoModel);

        this._idProjetoEdicao = projetoModel.id;

        this.mostrarBotaoGerarDic = !projetoModel.rascunho && this.statusProjeto != StatusProjetoEnum.Em_Elaboracao ;

        this.trocarModo(false);

        if (
          this.isProponente &&
          projetoModel.status == StatusProjetoEnum.Em_Analise
        ) {
          this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
            this._projetosService.gerarBotoesAcaoFormularioProponente()
          );
        } else {
          this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
            this._projetosService.gerarBotoesAcaoFormulario()
          );
          // Workaround para carregar o componente de rateio quando modo de edição
          setTimeout(() => {
            this.trocarModo(true);
          }, 2000);
        }
        if (!this.isProponente) {
          this.mostrarBotaoStatusProjeto = true;
        }
        this.loading = false;
        this.isLoadingPessoas = false;
      })
    );

    this._cadastrarProjeto$ = criar$.pipe(
      tap(() => {
       
        this.iniciarForm();

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this.isProponente ? this._projetosService.gerarBotoesAcaoFormularioProponente() : this._projetosService.gerarBotoesAcaoFormulario()
        );

        this.mostrarBotaoGerarDic = false;

        this.loading = false;
        this.isLoadingPessoas = false;

      })
    );

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Secretaria)
      .pipe(tap((response) => (this.organizacoesOpcoes = response)));

    this._getPlanosOpcoes$ = this._opcoesDropdownService
      .getOpcoesPlanos()
      .pipe(tap((response) => (this.planosOpcoes = response)));

    this._getTiposValorOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposValor()
      .pipe(tap((response) => (this.tiposValorOpcoes = response)));

      this._getTiposIndicadoresOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposIndicadores()
      .pipe(tap((response) => (this.indicadoresOpcoes = response)));

      

    this._getLocalidadesOpcoes$ = this._opcoesDropdownService
      .getOpcoesLocalidades()
      .pipe(
        tap((response) => {
          this.localidadesOpcoes = response;

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
      this._getPlanosOpcoes$,
      this._getTiposValorOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getLocalidadesOpcoes$,
      this._getTiposIndicadoresOpcoes$
    ).pipe(
      finalize(
        () => (this._rateioService.localidadesOpcoes = this.localidadesOpcoes)
      )
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
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

  public abrirModalStatusProjeto(modalTemplateRef: any): void {
    const modalRef = this._ngbModalService.open(modalTemplateRef, {
      centered: true,
    });
    modalRef.result.then(
      (result) => {
        this.alterarStatusProjeto(result);
      },
      (reject) => {}
    );
  }

  public filtrarResponsavelProponente(
    pessoasOpcoes: IOpcoesDropdownResponsavelProponente[]
  ): IOpcoesDropdownResponsavelProponente[] {
    return pessoasOpcoes.filter(
        (pessoa) => pessoa.agentePublicoSub != this.getControl('subResponsavelProponente').value
    );
  }

  public idMembroNgSelectChangeEvent(event: string): void {
    this.equipeService.idMembroNgSelectValue$.next(event);
    setTimeout(() => (this.idMembroEquipeElaboracao = null), 0);
  }

  public idIndicadorNgSelectChangeEvent(event: number): void {
    console.log( "indicador selecionado : " + event )
    this.indicadoresService.idIndicadorIndicadoresValue$.next(event);
    setTimeout(() => (this.idIndicadorIndicadores = null), 0);
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
    this._projetosService.baixarDIC(this._idProjetoEdicao);
  }
 
  private iniciarForm(projetoFormModel?: ProjetoFormModel): void {

    const valorInicialControleValorEstimado = projetoFormModel?.valor
      ? this._projetosService.construirValorControleValorEstimado(projetoFormModel?.valor)
      : null;
    const valorInicialControleIdMicrorregioesList = projetoFormModel?.rateio
        ? this._projetosService.construirValorControleIdMicrorregioesList(projetoFormModel.rateio)
        : [];
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
      valorEstimado: this._nnfb.control(valorInicialControleValorEstimado, [
        Validators.required,
        Validators.min(1),
      ]),
      idMicrorregioesList: this._nnfb.control(
        valorInicialControleIdMicrorregioesList,
        [Validators.required, Validators.minLength(1)]
      ),
      rateio: this._rateioService.construirRateioFormArray(
        projetoFormModel?.rateio
      ),
      valor: this._valorService.construirValorFormGroup(
        projetoFormModel?.valor
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
      nomeResponsavelProponente: this._nnfb.control(
        projetoFormModel?.nomeResponsavelProponente ?? null
      ),
      papelResponsavelProponente: this._nnfb.control(
        projetoFormModel?.papelResponsavelProponente ?? null,
      ),
      subResponsavelProponente: this._nnfb.control(
        projetoFormModel?.subResponsavelProponente ?? null
      ),
      indicadoresProjeto: this.indicadoresService.construirindicadoresFormArray(
        projetoFormModel?.indicadoresProjeto
      ),
    });

    this.projetoFormValueChanges();
    
    this.valorFormValueChanges();

    if ( this.isProponente && !projetoFormModel )
      this.usuarioProponenteValoresIniciaisProjetoForm();
    
  }
  
  private usuarioProponenteValoresIniciaisProjetoForm(): void {
    
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;
    
    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);
    
    if ( this.isProponente ){
      setTimeout(() => {
        idOrganizacaoFormControl.disable({ emitEvent: false });
      });
    }

    this.equipeService.usuarioProponenteValoresIniciaisEquipeFormArray(
      this._usuarioService.usuarioPerfil.idPessoa
    );

  }

  private projetoFormValueChanges(): void {

    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    idOrganizacaoFormControl.valueChanges.subscribe((idOrganizacaoValue) => {
      if (this.isModoEdicao) {
        this.idOrganizacaoChange(idOrganizacaoValue);
        if (this.isProponente) {
          setTimeout(() => {
            idOrganizacaoFormControl.disable({ emitEvent: false });
          });
        } 
      }

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
      setTimeout(() => {
        this._rateioService.moedaFormControlReferencia$.next(moedaValue);
      });
    });

    quantiaFormControl.valueChanges.subscribe((quantiaValue) => {
      this._rateioService.quantiaFormControlReferencia$.next(quantiaValue);
    });
    

  }

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    this.isLoadingPessoas = true;

    if (!idOrganizacaoValue) {
      idResponsavelProponenteFormControl.patchValue(null);
      idResponsavelProponenteFormControl.markAsTouched();
      this.isLoadingPessoas = false;
      return;
    }
    
    this.pessoasOpcoes = [];

    this._pessoasService
      .buscarResponsavelPorIdOrganizacaoAC(idOrganizacaoValue)
      .subscribe({
        next: (response) => {
          this.pessoasOpcoes = this.pessoasOpcoesFiltrada = response;
          this.isLoadingPessoas = false;
        },
        error: () => {
          this.pessoasOpcoes = this.pessoasOpcoesFiltrada = [];
          this.isLoadingPessoas = false;
        },
      });

  }

  private executarAcaoBreadcrumb(acao: TBotaoAcao): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Editar:
        this.trocarModo(true);
        break;

      case BreadcrumbAcoesEnum.Cancelar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Projetos
        );
        break;

      case BreadcrumbAcoesEnum.Salvar:
        this.submitProjetoForm(this.projetoForm, true);
        break;

      case BreadcrumbAcoesEnum.Enviar:
        this.submitProjetoForm(this.projetoForm, false);
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

  private validarProjetoFormProponenteRateio(): Array<RateioModel> {
    
    const idMicrorregioesListFormControl = this.projetoForm.get(
      'idMicrorregioesList'
    ) as FormControl<Array<number>>;

    const valorEstimadoFormControl = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number>;
    
    return this._projetosService.construirProjetoModelRateio(
      idMicrorregioesListFormControl.value,
      valorEstimadoFormControl.value
    );

  }

  private validarProjetoFormProponenteValor(): ValorModel {
    const valorEstimadoFormControl = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number>;

    return this._projetosService.construirProjetoModelValor(
      valorEstimadoFormControl.value
    );
  }

  private submitProjetoForm(form: FormGroup, isRascunho: boolean): void {
    
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {

      Object.keys(form.controls).forEach((key) => {
        const control = form.get(key);
        if (control && control.invalid) {
          console.warn(`Campo inválido: ${key}`, control.errors);
        }
      });

      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    form.get('valor.tipo')?.enable();

    const payload = new ProjetoFormModel(form.value as IProjetoForm);
   
    if (this.isProponente) {
      payload.rateio = this.validarProjetoFormProponenteRateio();
      payload.valor = this.validarProjetoFormProponenteValor();
      payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;
    }

    const requisicao = this._idProjetoEdicao
      ? this.atualizarProjeto(payload, isRascunho)
      : this.cadastrarProjeto(payload, isRascunho);

    requisicao.subscribe();
  }

  onSelecionarPessoa(pessoa: any) {
    if (pessoa) {
      this.projetoForm.patchValue({
        idResponsavelProponente: pessoa.id,
        nomeResponsavelProponente: pessoa.nome,
        papelResponsavelProponente: pessoa.papelPrioritario,
        subResponsavelProponente: pessoa.agentePublicoSub
      });
    } else {
      this.projetoForm.patchValue({
        idResponsavelProponente: null,
        nomeResponsavelProponente: '',
        papelResponsavelProponente: '',
        subResponsavelProponente: ''
      });
    }
  }

  private cadastrarProjeto(
    payload: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {
      if (payload.idResponsavelProponente === 0) {
        const dados = this.projetoForm.value;
        return this._pessoasService.getBySub(dados.subResponsavelProponente).pipe(
          switchMap((idPessoa: number) => {
            payload.idResponsavelProponente = idPessoa;
            return this._projetosService.post(payload, isRascunho);
          }),
          tap(() => {
            this._toastService.showToast('success', 
            'Projeto cadastrado com sucesso.');
          }),
          finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
        );
      }
    return this._projetosService.post(payload, isRascunho).pipe(
      tap((response: IProjeto) => {
        this._toastService.showToast(
          'success',
          'Projeto cadastrado com sucesso.'
        );
      }),
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
    );
  }

  private atualizarProjeto(
    payload: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {
    if (payload.idResponsavelProponente === 0) {
      const dados = this.projetoForm.value;
      return this._pessoasService.getBySub(dados.subResponsavelProponente).pipe(
        switchMap((idPessoa: number) => {
          payload.idResponsavelProponente = idPessoa;
          return this._projetosService.put(this._idProjetoEdicao, payload, isRascunho)
        }),
        tap(() => {
          this._toastService.showToast('success', 
          'Projeto alterado com sucesso.');
        }),
        finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
      );
    }
    return this._projetosService.put(this._idProjetoEdicao, payload, isRascunho)
      .pipe(
      tap((response: IProjeto) => {
        this._toastService.showToast(
          'success',
          'Projeto alterado com sucesso.'
        );
      }),
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
    );

  }

  private alterarStatusProjeto(status: string): void {
    this._projetosService
      .alterarStatusProjeto(this._idProjetoEdicao, status)
      .pipe(
        tap((response: string) => {
          this._toastService.showToast('success', response);
        }),
        finalize(() =>
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar)
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._rateioService.resetarRateio();
    this._projetosService.idProjeto$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

}
