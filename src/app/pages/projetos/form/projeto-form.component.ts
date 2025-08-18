import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  catchError,
  Subject,
  merge,
  debounceTime,
  distinctUntilChanged,
  of,
  shareReplay,
  take,
  interval,
  takeUntil,
  timer,
  takeWhile
} from 'rxjs';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
  IMotivoArquivamentoOpcoesDropdown,
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
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { IAcao } from '../../../core/interfaces/acoes.interface';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { EquipeModel } from '../../../core/models/equipe.model';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss',
})
export class ProjetoFormComponent implements OnInit, OnDestroy {

  private readonly _subscription: Subscription = new Subscription();

  private _atualizarProjeto$: Observable<IProjeto> = EMPTY; 
  private _cadastrarProjeto$: Observable<number> = EMPTY;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPlanosOpcoes$: Observable<IOpcoesDropdown[]>; 
  private readonly _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getLocalidadesOpcoes$: Observable<ILocalidadeOpcoesDropdown[]>;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposMotivosArquivamentoOpcoes$: Observable<IMotivoArquivamentoOpcoesDropdown[]>;
   
  private _idProjetoEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = false;
  //public moedaProjeto: string = '';
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
  public pessoasOpcoesGoves: IOpcoesDropdownResponsavelProponente[] = [];
  public equipeProjeto: IEquipe[] = [];

  public planosOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];
  public localidadesOpcoes: ILocalidadeOpcoesDropdown[] = [];
  public microrregioesOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoesVisiveis: IOpcoesDropdown[] = [];
  public tiposMotivoArquivamentoOpcoes: IMotivoArquivamentoOpcoesDropdown[] = [];

  public indicadoresOpcoes: IOpcoesDropdown[] = [];

  public statusProjeto: string = '';
  public statusProjetoNovo: string | null = null;
  public statusProjetoOpcoes: Array<string> = [];
  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();
  public idMembroEquipeElaboracao:  | null = null;
  public idIndicadorIndicadores:  | null = null;
  public isLoadingPessoas = false;
  public isLoadingPessoasFiltroTermo = false;
  public exibirLista = true;
  public lotacaoGestorProjeto: string = '';
  public nomeProponenteResponsavel: string = '';
  public isUsuarioProponenteResponsavel: boolean = false;
  
  @ViewChild('enviarProjetoModal') enviarProjetoModalTemplate: TemplateRef<any> | undefined; 
  @ViewChild('autuarConfirmacaoProjetoModal') confirmarIntegracaoProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('confirmarRevisarProjetoModal') confirmarRevisarProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('confirmarArquivarProjetoModal') confirmarArquivarProjetoModalTemplate: TemplateRef<any> | undefined;
  
  // otimizacao carga agentes goves.. 
  pessoas$: Observable<IOpcoesDropdownResponsavelProponente[]> = of([]);
  input$ = new Subject<string>();

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
    public indicadoresService: IndicadoresService,
    public acoesService: AcoesService,
    private route: ActivatedRoute,
    private router: Router
    ) {

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Secretaria)
      .pipe(tap((response) => (this.organizacoesOpcoes = response)));

    this._getPlanosOpcoes$ = this._opcoesDropdownService
      .getOpcoesPlanos()
      .pipe(tap((response) => (this.planosOpcoes = response)));

    this._getTiposValorOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposValor()
      .pipe(tap((response) => (this.tiposValorOpcoes = response)));

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
      .pipe(tap((response) =>  {
        this.tiposPapelOpcoes = response;
          const idsPermitidos = [1, 5];
          this.tiposPapelOpcoesVisiveis = response.filter( papel => idsPermitidos.includes(papel.id) ); 
        } 
      ));

    this._getTiposMotivosArquivamentoOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposArquivamento()
      .pipe( tap((response) => {
        this.tiposMotivoArquivamentoOpcoes = response;
      }) );

    this._getAllOpcoes$ = concat(
      this._getOrganizacoesOpcoes$,
      this._getPlanosOpcoes$,
      this._getTiposValorOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getLocalidadesOpcoes$,
      this._getTiposMotivosArquivamentoOpcoes$
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

  private carregarProjetoEditar(idProjeto: number): void {
      this._atualizarProjeto$ = this._projetosService
        .getById(idProjeto)
        .pipe(
          tap((response: IProjeto) => {
            
          }),
          map<IProjeto, ProjetoModel>((response: IProjeto) => new ProjetoModel(response)),
          catchError((error) => {
            this._toastService.showToast(
              'error',
              'Erro ao carregar projeto',
              ['Verifique se o projeto está válido.']
            );
            this.loading = false;
            this.isLoadingPessoasFiltroTermo = false;
            return EMPTY;
          }),
          tap((projetoModel: ProjetoModel) => {

            this.statusProjeto = projetoModel.status;
            this.lotacaoGestorProjeto = projetoModel.lotacaoProponenteResponsavel;  
            this.nomeProponenteResponsavel = projetoModel.nomeProponenteResponsavel;

            this.statusProjetoOpcoes = Object.values(StatusProjetoEnum).filter(
              (status) => status != this.statusProjeto
            );
    
            this.iniciarForm(projetoModel);

            this._idProjetoEdicao = projetoModel.id;
    
            this.mostrarBotaoGerarDic =
              !projetoModel.rascunho &&
              this.statusProjeto !== StatusProjetoEnum.Em_Elaboracao;
    
            this.equipeProjeto = projetoModel.equipeElaboracao;

            this.isUsuarioProponenteResponsavel = projetoModel.subResponsavelProponente === this._usuarioService.usuarioPerfil.subNovo;

            if ( projetoModel.status === StatusProjetoEnum.Em_Analise ){
              this.trocarModo(false);
            }

            // 
            if (projetoModel.status === StatusProjetoEnum.Arquivado) {
              this.mostrarBotaoGerarDic = false;
              this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                this._projetosService.gerarBotoesAcaoFormularioArquivado()
              );
              setTimeout(() => this.trocarModo(false), 2000);
              this.loading = false;
              this.isLoadingPessoas = false;
              return;
            }

            const emElaboracaoSemProtocolo = 
              projetoModel.status === StatusProjetoEnum.Em_Elaboracao &&
              !projetoModel.protocoloEdocs;

            if (this.isProponente) {
              if (emElaboracaoSemProtocolo && this.isUsuarioProponenteResponsavel) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnalise()
                );
              } else if (projetoModel.protocoloEdocs) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao()
                );
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponente()
                );
                setTimeout(() => this.trocarModo(true), 2000);
              }
            } else {
              if (emElaboracaoSemProtocolo && this.isUsuarioProponenteResponsavel) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioUsuarioProponenteResponsavel()
                );
                this.trocarModo(true);
              } else if (projetoModel.protocoloEdocs) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao()
                );
                this.trocarModo(false);
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormulario()
                );
                setTimeout(() => this.trocarModo(true), 2000);
              }
            }
    
            if (!this.isProponente && !projetoModel.protocoloEdocs ) {
              this.mostrarBotaoStatusProjeto = true;
            }
    
            this.loading = false;
            this.isLoadingPessoas = false;

          })
        );
  }

  ngOnInit(): void {
    
    const rotaAtual = this.route.snapshot.routeConfig?.path;
    if (rotaAtual === 'criar') {
      this._projetosService.idProjeto$.next(0);
    }

    const idPelaUrl = this.route.snapshot.paramMap.get('id');
    if (idPelaUrl) {
      this._projetosService.idProjeto$.next(+idPelaUrl);
      this._navegacaoService.navegacaoSimples(
        BreadcrumbContextoEnum.Projetos,
        BreadcrumbAcoesEnum.Editar
      );
    }

    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
    this.usuario_IdOrganizacoes =
    this._usuarioService.usuarioPerfil.idOrganizacoes;
           
    this._projetosService.idProjeto$.pipe(take(1)).subscribe(idProjeto => {

      if (idProjeto > 0) {
        this.carregarProjetoEditar(idProjeto);
      } else {

        this.iniciarForm();
    
        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this.isProponente ? this._projetosService.gerarBotoesAcaoFormularioProponente() : this._projetosService.gerarBotoesAcaoFormulario()
        );

        this.trocarModo(true);
    
        this.mostrarBotaoGerarDic = false;
        this.loading = false;
        this.isLoadingPessoas = false;

      }
    });

    this._subscription.add(this._getAllOpcoes$.subscribe());
    this._subscription.add(this._atualizarProjeto$.subscribe());
    this._subscription.add(this._cadastrarProjeto$.subscribe());
    this._pessoasService.buscarTodosAgentesPublicosGoves().subscribe({
      error: (err) => console.error('Erro ao carregar em cache lista de todos agentes públicos ligados ao Governo :', err)
    });

  }

  private carregarPessoasPorOrganizacao(): void {
    
    const idOrganizacaoFormControl = this.projetoForm.get('idOrganizacao') as FormControl<number | null>;

    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);

    this.isLoadingPessoas = true;

    this._pessoasService.buscarResponsavelPorIdOrganizacaoAC(this.usuario_IdOrganizacoes[0])
      .subscribe({
      next: (response) => {

        this.pessoasOpcoes = response;
        this.isLoadingPessoas = false;

        const subResponsavelProponente = this.projetoForm.get('subResponsavelProponente')?.value
        const pessoa = this.pessoasOpcoes.find( p => p.agentePublicoSub === subResponsavelProponente );
        this.projetoForm.patchValue({ nomeResponsavelProponente: pessoa?.nome.toUpperCase() || ' - ' });
        
      },
      error: () => {
        this.pessoasOpcoes = [];
        this.isLoadingPessoas = false;
      }
    });

  }

  public getRateioService(): RateioService {
    return this._rateioService;
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

  public async idMembroNgSelectChangeEvent(event: IOpcoesDropdownResponsavelProponente): Promise<void> {
    await this.equipeService.idMembroNgSelectValue$.next(event);
    this.exibirLista = false;
  }

  public idIndicadorNgSelectChangeEvent(event: number): void {
    this.indicadoresService.idIndicadorIndicadoresValue$.next(event);
    setTimeout(() => (this.idIndicadorIndicadores = null), 0);
  }
    
  public baixarDIC(): void {
    this._projetosService.baixarDIC(this._idProjetoEdicao);
  }
 
  private iniciarForm(projetoFormModel?: ProjetoFormModel): void {

    const valorInicialControleValorEstimado = projetoFormModel?.valor
      ? this._projetosService.construirValorControleValorEstimado(projetoFormModel?.valor)
      : null;

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
      ]),
      rateio: this._rateioService.construirRateioFormArray(
        projetoFormModel?.rateio
      ),
      valor: this._valorService.construirValorFormGroup(
        projetoFormModel?.valor
      ),
      nomeagente: this._nnfb.control(projetoFormModel?.nomeagente ?? null, 
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
      acoesProjeto: this.acoesService.construirAcoesFormArray(
        projetoFormModel?.acoesProjeto
      ),
      pecasPlanejamento: this._nnfb.control(
        projetoFormModel?.pecasPlanejamento ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      enviarProjetoGestor: this._nnfb.control(
        projetoFormModel?.enviarProjetoGestor ?? false, 
      ),
      justificativaRevisao: this._nnfb.control(
        projetoFormModel?.justificativaRevisao ?? null
      ),
      justificativaArquivamento: this._nnfb.control(
        projetoFormModel?.justificativaArquivamento ?? null
      ),
      protocoloEdocs: this._nnfb.control(
        projetoFormModel?.protocoloEdocs ?? '' 
      ),
      codigoMotivoArquivamento: this._nnfb.control( 
        projetoFormModel?.codigoMotivoArquivamento ?? '' 
      )
    });
        
    this.carregarPessoasPorOrganizacao();
        
    this.projetoFormValueChanges();
    
    this.valorFormValueChanges();

    if ( this.isProponente && !projetoFormModel )
      this.usuarioProponenteValoresIniciaisProjetoForm();

  }
  
  private usuarioProponenteValoresIniciaisProjetoForm(): void {

    const idOrganizacaoFormControl = this.projetoForm.get('idOrganizacao') as FormControl<number | null>;
    
    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);
  
    const indexGestor = this.pessoasOpcoes.findIndex( pessoa => pessoa.gestorOrganizacao === true );

    if( indexGestor > 0 ){
      this.projetoForm.patchValue({
        idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
        nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toLowerCase,
        papelResponsavelProponente: this.pessoasOpcoes[indexGestor].papelPrioritario,
        subResponsavelProponente: this.pessoasOpcoes[indexGestor].agentePublicoSub
      });
    } else {
      if (this.pessoasOpcoes.length > 0){
        this.projetoForm.patchValue({
          idResponsavelProponente: null,
          nomeResponsavelProponente: '',
          papelResponsavelProponente: '',
          subResponsavelProponente: ''
        });
      }
    }

  }
 
  private projetoFormValueChanges(): void {

    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;
    
    idOrganizacaoFormControl.valueChanges.subscribe((idOrganizacaoValue) => {
      this.idOrganizacaoChange(idOrganizacaoValue);
      if (this.isModoEdicao) {
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

    //this.moedaProjeto = moedaFormControl.value ?? '';

    if (!tipoFormControl.value) {
      // Caso específico de Projetos; tipo do valor somente pode ser 'Estimado'
      tipoFormControl.patchValue(TipoValorEnum.Estimado);
      tipoFormControl.disable();
    }

    /*
    moedaFormControl.valueChanges.subscribe((moedaValue) => {
      setTimeout(() => {
        this._rateioService.moedaFormControlReferencia$.next(moedaValue);
      });
    });
    */

    quantiaFormControl.valueChanges.subscribe((quantiaValue) => {
      this._rateioService.quantiaFormControlReferencia$.next(quantiaValue);
    });

  }

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    const subResponsavelProponente = this.projetoForm.get( 
      'subResponsavelProponente'
    ) as FormControl<string | null>
        
    if (!idOrganizacaoValue) {
      idResponsavelProponenteFormControl.patchValue(null);
      idResponsavelProponenteFormControl.markAsTouched();
      this.isLoadingPessoas = false;
      return;
    }

    this.isLoadingPessoas = true;

    const subResponsavelProponenteValor = subResponsavelProponente.value;
    
    if(!subResponsavelProponenteValor) {

      this._pessoasService
        .buscarResponsavelPorIdOrganizacaoAC(idOrganizacaoValue)
        .subscribe({
          next: (response) => {
            this.pessoasOpcoes = this.pessoasOpcoesFiltrada = response;
            this.isLoadingPessoas = false;
            
            const indexGestor = this.pessoasOpcoes.findIndex(
                pessoa => pessoa.gestorOrganizacao === true
              );
                        
            if( indexGestor > 0 ){
              this.projetoForm.patchValue({
                idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
                nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toUpperCase(),
                papelResponsavelProponente: this.pessoasOpcoes[indexGestor].papelPrioritario,
                subResponsavelProponente: this.pessoasOpcoes[indexGestor].agentePublicoSub
              });
            } else {
              if (this.pessoasOpcoes.length > 0){
                this.projetoForm.patchValue({
                  idResponsavelProponente: null,
                  nomeResponsavelProponente: '',
                  papelResponsavelProponente: '',
                  subResponsavelProponente: ''
                });
              }
            }
            
          },
          error: () => {
            this.pessoasOpcoes = this.pessoasOpcoesFiltrada = [];
            this.isLoadingPessoas = false;
          },
        });

    }else{
      this.isLoadingPessoas = false;
    }

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
        this.projetoForm.patchValue({
          enviarProjetoGestor : true
        });
        this.validacaoSomaValoresAcoesEnviar(this.projetoForm, false);
        break;

      case BreadcrumbAcoesEnum.Autuar:
        this.projetoForm.patchValue({
          autuarConfirmacaoProjetoModal : true,
          enviarProjetoGestor : false
        });
        if( this.compararValorEstimadoValorAcoes() ) {
          this.abrirConfirmarIntegracapEdocsModal(this.projetoForm)
        }else{
          this._toastService.showToast('error', 'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.', 
            ['A soma dos valores estimado das ações deve ser igual ao valor estimado do projeto.',]);
        }
        break;

      case BreadcrumbAcoesEnum.Voltar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Projetos
        );
        break;

      case BreadcrumbAcoesEnum.Revisar:
          this.abrirRevisarModal(this.projetoForm)
        break;

      case BreadcrumbAcoesEnum.Arquivar:
          this.abrirArquivarModal(this.projetoForm)
        break;

    }
  }

  private validacaoSomaValoresAcoesEnviar(form: FormGroup, isRascunho: boolean): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.abrirConfirmarEnvioMembroModal(form)
    }else{
      this._toastService.showToast('error', 'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.', 
        ['A soma dos valores estimado das ações deve ser igual ao valor estimado do projeto.',]);
    }
  }

  private compararValorEstimadoValorAcoes(): boolean {
    
    const valorEstimadoProjeto = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number>;

    const valorFormGroup = this.projetoForm.get('valor') as FormGroup<ValorFormType>;
    const quantiaFormControl = valorFormGroup.get('quantia') as FormControl<number | null >;
    const acoesProjetoValues = this.projetoForm.get('acoesProjeto')?.value;

    if (!acoesProjetoValues) return false;

    const totalValorAcoesInformadas = acoesProjetoValues
      .filter((acao: IAcao) => acao.idStatus === TipoStatusEnum.Ativo)
      .reduce((sum: number, acao: { valorEstimadoAcaoPrincipal: any; }) => {
                const valor = Number(acao.valorEstimadoAcaoPrincipal) || 0;
                return sum + valor;
        }, 0);

    const valorSomaAcoes = Number(totalValorAcoesInformadas) || 0;
    const valorEstimadoTotal = Number(quantiaFormControl.value) || Number(valorEstimadoProjeto.value);

    return Math.abs(valorSomaAcoes - valorEstimadoTotal) < 0.001;

  }
  
  private trocarModo(permitir: boolean): void {

    this.isModoEdicao = permitir;
    const projetoFormControls = this.projetoForm.controls;

    alterarEstadoControlesFormulario(permitir, projetoFormControls);

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    this.projetoForm.get('valor.tipo')?.disable();

    // Caso especifico para os campos de justificativa (revisao e arquivamento ) na autuacao de projeto..
    this.projetoForm.get('justificativaRevisao')?.enable();
    this.projetoForm.get('justificativaArquivamento')?.enable();
    this.projetoForm.get('codigoMotivoArquivamento')?.enable();

  }

  private validarFormulario(form: FormGroup ) : boolean {

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
      return false;

    }

    // valida se tem pelo menos uma acao ATIVA no form
    const acoesAtivas = this.projetoForm.get('acoesProjeto')?.value
      .filter((acao: IAcao) => acao.idStatus === TipoStatusEnum.Ativo);
    
    if (acoesAtivas.length === 0) {

      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Nenhuma ação informada.',
      ]);

      return false;

    }

    return true;

  }

  private submitProjetoForm(form: FormGroup, isRascunho: boolean): void {

    if ( this.validarFormulario(form) ) {

      // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
      form.get('valor.tipo')?.enable();

      const payload = new ProjetoFormModel(form.value as IProjetoForm);

      if (this.isProponente) {
        payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;
      }

      const requisicao = this._idProjetoEdicao
        ? this.atualizarProjeto(payload, isRascunho)
        : this.cadastrarProjeto(payload, isRascunho);

      requisicao.subscribe();

    }

  }

  onSelecionarPessoa(pessoa: any) {
    
    if (pessoa) {
      this.projetoForm.patchValue({
        idResponsavelProponente: pessoa.id,
        nomeResponsavelProponente: pessoa.nome.toUpperCase(),
        papelResponsavelProponente: pessoa.papelPrioritario,
        subResponsavelProponente: pessoa.agentePublicoSub
      });
      this.lotacaoGestorProjeto = pessoa.papelPrioritario;
    } else {
      this.projetoForm.patchValue({
        idResponsavelProponente: null,
        nomeResponsavelProponente: '',
        papelResponsavelProponente: '',
        subResponsavelProponente: ''
      });
      this.lotacaoGestorProjeto = '';
    }    

  }

  private cadastrarProjeto(
    payload: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {

      const usuarioProponente = payload.equipeElaboracao.some(
        membro => membro.idPessoa === this._usuarioService.usuarioPerfil.idPessoa && membro.idPapel === TipoPapelEnum.Proponente
      );

      if( !usuarioProponente ){
        
        const novoMembro: EquipeModel = {
          subPessoa: this._usuarioService.usuarioPerfil.subNovo,
          idPessoa: this._usuarioService.usuarioPerfil.idPessoa,
          idPapel: TipoPapelEnum.Proponente,
          idStatus: TipoStatusEnum.Ativo,
          justificativa: null,
          nome: this._usuarioService.usuarioPerfil.nome,
          papelNome: 'Elaborador'
        };
        
        payload.equipeElaboracao.push(novoMembro);

      }
     
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

  public buscarAgentesPorTermo(): IOpcoesDropdownResponsavelProponente[] {
    
    this.isLoadingPessoasFiltroTermo = true;
    
    const termo = this.projetoForm.get('nomeagente')?.value ?? '';

    if ( termo.length < 3 ) {
      this._toastService.showToast(
        'info',
        'Informe pelo menos um nome com no mínimo 3 caracteres.'
      );
      this.pessoasOpcoesGoves = [];
      this.isLoadingPessoasFiltroTermo = false;
      return this.pessoasOpcoesGoves;
    }

    this._pessoasService.buscarAgentesPorTermo(termo)
    .subscribe({
      next: (lista) => {
        
        this.pessoasOpcoesGoves = lista;
        
        this.pessoasOpcoesGoves = this.pessoasOpcoesGoves.filter(pessoa =>
          !this.equipeProjeto.some(membro => membro.subPessoa === pessoa.agentePublicoSub)
        );

        if( this.pessoasOpcoesGoves.length === 0 ){
          this._toastService.showToast(
            'info',
            'Nenhum agente encontrado.',
            ['Verifique se já faz parte da equipe.'] );
        }
                
        this.isLoadingPessoasFiltroTermo = false;
        this.exibirLista = true;

        this.projetoForm.get('nomeagente')?.reset();

      },
      error: () => {
        this.pessoasOpcoesGoves = [];
        this.isLoadingPessoasFiltroTermo = false;
      }

    });
    
    return this.pessoasOpcoesGoves;

  }

  public abrirConfirmarEnvioMembroModal( form: FormGroup
  ) {

    this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';
    
    const modalRef = this._ngbModalService.open( this.enviarProjetoModalTemplate , {
        centered: true,
        size: 'lg',
      });

      modalRef.result.then(
        (result) => {
          if (result === 'confirmado') {
             this.submitProjetoForm(form, false);
          }
        },
        (reason) => {
          // console.log('Usuário cancelou:', reason);
        }
      );

  }

  public abrirRevisarModal( form: FormGroup
  ) {
    
    const controlJustificativaRevisao = form.get('justificativaRevisao');
    controlJustificativaRevisao?.setValidators([Validators.required, Validators.maxLength(200)]);
    controlJustificativaRevisao?.updateValueAndValidity();
        
    const modalRef = this._ngbModalService.open( this.confirmarRevisarProjetoModalTemplate , {
      centered: true,
      size: 'lg',
    });
    
    modalRef.result.then(
      (result) => {

        if (result === 'confirmado') {
           this.enviarProjetoRevisaoForm(this.projetoForm);
        }

      },
      (reason) => {
        //console.log('Usuário cancelou:', reason);
      }
    );

  }

  public abrirArquivarModal( form: FormGroup ) {

    const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento');
    codigoMotivoArquivamento?.setValidators([Validators.required, Validators.maxLength(200)]);
    codigoMotivoArquivamento?.updateValueAndValidity();
            
    const modalRef = this._ngbModalService.open( this.confirmarArquivarProjetoModalTemplate , {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(

      (result) => {
        if (result === 'confirmado') {
          this.enviarProjetoArquivamentoForm(form);
        }
      },
      (reason) => {
        //console.log('Usuário cancelou:', reason);
      }

    );

    this.projetoForm.get('codigoMotivoArquivamento')?.patchValue(null);
    this.projetoForm.get('justificativaArquivamento')?.patchValue(null);

  }

  public validarEnvioArquivamento( modal: NgbActiveModal )  {
    
    if (this.projetoForm.invalid) {
      this.projetoForm.markAllAsTouched(); 
      return; 
    }
  
    modal.close('confirmado'); 

  }

  public abrirConfirmarIntegracapEdocsModal( form: FormGroup
  ) {

    if ( this.validarFormulario(form) ) {

      this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';

      const modalRef = this._ngbModalService.open( this.confirmarIntegracaoProjetoModalTemplate , {
          centered: true,
          size: 'lg'
        });

        modalRef.result.then(
          (result) => {
            if (result === 'confirmado') {
              this.autuarProjetoForm(this.projetoForm);
            }
          },
          (reason) => {
            //console.log('Usuário cancelou:', reason);
          }
        );

    }

  }

  private autuarProjetoForm(form: FormGroup): void {

    if ( this.validarFormulario(form) ) {

      // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
      form.get('valor.tipo')?.enable();
          
      const payload = new ProjetoFormModel(form.value as IProjetoForm);

      payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;

      console.log(JSON.stringify(payload, null, 2));
    
      this.autuarProjetoAsync(payload);

    }

  }

  private enviarProjetoRevisaoForm(form: FormGroup): void {
    
    this._projetosService
    .enviarEmailRevisarProjeto( this._idProjetoEdicao, this.projetoForm.get('justificativaRevisao')?.value )
    .subscribe({
      next: (response: string) => {
        this._toastService.showToast('success', response);
        this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
      },
      error: (err) => {
        this._toastService.showToast('error', 'Erro ao enviar revisão: ' + err);
      }
    });

  }

  private enviarProjetoArquivamentoForm(form: FormGroup): void {
    
    const textoJustificativa = this.projetoForm.get('justificativaArquivamento')?.value
    const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento')?.value
    
    this._projetosService
    .enviarEmailArquivarProjeto( this._idProjetoEdicao, textoJustificativa, codigoMotivoArquivamento )
    .subscribe({
      next: (response: string) => {
        this._toastService.showToast('success', response);
        this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
      },
      error: (err) => {
        this._toastService.showToast('error', 'Erro ao enviar aviso de arquivamento: ' + err);
      }
    });

  }
  
  private autuarProjetoAsync(payload: ProjetoFormModel): void {

    this._projetosService.autuarProjetoEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this._toastService.showToast(
            'info',
            'Processo de autuação iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.'
          );
          return EMPTY;
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingProtocolo();
      });

  }
  
  private iniciarPollingProtocolo(): void {

    const intervalo = 2000; 
    const timeout = 30000;  
  
    interval(intervalo).pipe(
      takeUntil(timer(timeout)), 
      switchMap( () =>
        this._projetosService
          .getById(this._idProjetoEdicao)
          .pipe(
            tap((response: IProjeto) => {
            }),
            map<IProjeto, ProjetoModel>((response: IProjeto) => new ProjetoModel(response)),
            catchError(() => of(null))
          )
      ),
      takeWhile((projeto: ProjetoModel | null) => {
        if (!projeto) return true;
        return !projeto.protocoloEdocs; 
      }, true ) 
    ).subscribe((projetoFinal: ProjetoModel | null) => {
      
      if (projetoFinal && projetoFinal.protocoloEdocs) {
        
        const protocoloEdocsFormControl = this.projetoForm.get('protocoloEdocs') as FormControl<string | null>;
        
        protocoloEdocsFormControl.patchValue(projetoFinal.protocoloEdocs);
        
        this._projetosService.protocoloAtualizado$.next({
          idProjeto: this._idProjetoEdicao,
          protocolo: projetoFinal.protocoloEdocs
        });

        this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);

      }

    });

  }
  
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._rateioService.resetarRateio();
    //this._projetosService.idProjeto$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

  confirmarJustificativaRevisao(modal: NgbModalRef): void {
    const control = this.projetoForm.get('justificativaRevisao'); 
  
    if (!control || control.invalid || !control.value?.trim()) {
      control?.markAsTouched(); 
      return; 
    }
  
    modal.close('confirmado'); 
  }

  confirmarJustificativaArquivamento(modal: NgbModalRef): void {

    const controlJustificativaArquivamento = this.projetoForm.get('justificativaArquivamento');

    const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento');

    if( codigoMotivoArquivamento?.value == null || codigoMotivoArquivamento?.value?.trim() === '' ) {
      this._toastService.showToast(
        'error',
        'Informe o motivo para arquivamento.'
      );
      return;
    }

    // se clicar na opcao outros obriga o preenchimento da justificativa.
    if( codigoMotivoArquivamento?.value?.trim() === 'M11'){      
      controlJustificativaArquivamento?.setValidators([Validators.required, Validators.maxLength(200)]);
      controlJustificativaArquivamento?.updateValueAndValidity();
      if ( ( !controlJustificativaArquivamento || controlJustificativaArquivamento.invalid || !controlJustificativaArquivamento.value?.trim() ) ) {
        controlJustificativaArquivamento?.markAsTouched(); 
        return;
      }

    }

    modal.close('confirmado');

  }

}
