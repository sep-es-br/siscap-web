import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  Subscription,
  switchMap,
  tap,
  EMPTY,
  catchError,
  Subject,
  of,
  take,
  interval,
  takeUntil,
  filter,
  startWith,
  mergeAll,
  forkJoin,
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
  BreadcrumbContextoEnum
} from '../../../core/enums/breadcrumb.enum';
import { TipoValorEnum } from '../../../core/enums/tipo-valor.enum';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { IAcao } from '../../../core/interfaces/acoes.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { EquipeModel } from '../../../core/models/equipe.model';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { ProjetoIntegracaoEdocsFasesModel } from '../../../core/models/projeto-integracao-edocs-fases.model';
import { FasesEdocsIntegracaoEnum, FaseStatuEnum } from '../../../core/enums/fases-edocs-integracao.enum';
import { IEstruturaCamposComplementar, IEstruturaCamposComplementarProjeto } from '../../../core/interfaces/estrutura.campo.complementar.dic.interface';
import { ContextoIntegracaoEdocsEnum } from '../../../core/enums/contexto-integracao-edocs.enum';
import { IParecer } from '../../../core/interfaces/parecer.interface';
import { ParecerService } from '../../../core/services/parecer/parecer.service';
import { StatusParecerEnum } from '../../../core/enums/status-parecer.enum';
import { LotacaoUsuarioEnum } from '../../../core/enums/lotacao-usuario.enum';
import { animate, query, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss'
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

  public mostrarBotaoBaixarDic: boolean = false;
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
  public idMembroEquipeElaboracao: | null = null;
  public idIndicadorIndicadores: | null = null;
  public isLoadingPessoas = false;
  public isLoadingPessoasFiltroTermo = false;
  public exibirLista = true;
  public lotacaoGestorProjeto: string = '';
  public nomeProponenteResponsavel: string = '';
  public isUsuarioProponenteResponsavel: boolean = false;

  public aguardandoAssinatura: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public aguardandoAutuacao: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public aguardandoEntranhamento: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public aguardandoDespacho: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public aguardandoAvocamento: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public aguardandoDesentranhamento: FaseStatuEnum = FaseStatuEnum.NAO_INICIADA;
  public FaseStatusEnum = FaseStatuEnum;
  public FasesEdocsIntegracaoEnum = FasesEdocsIntegracaoEnum;

  public listaFasesIntegracaoProjeto: ProjetoIntegracaoEdocsFasesModel[] = [];

  public autuacaoAcionada: boolean = false;

  public podeEditar: boolean = false;
  public podeSoilictarComplementacao: boolean = false;
  public podeResponderComplementacao: boolean = false;

  public erroEmAlgumaFaseModalAutuacao: boolean = false;

  public camposParaComplementacao: IEstruturaCamposComplementar[] = [];
  public camposComplementarProjeto: IEstruturaCamposComplementarProjeto[] = [];

  public parecerProjetoUsuario: IParecer = {} as IParecer;
  public lotacaoUsuario: number = LotacaoUsuarioEnum.OUTRO;
  public pareceresProjeto: IParecer[] = [];

  public mostrarBotaoPedirRevisaoDic: boolean = false;

  public subProponenteDIC: string = '';
  public nomeProponenteDIC: string = '';

  public assinarAutuar: boolean = true;
  public emProcessamentIntegracao: boolean = false;
  public finalizadoProcessamentoIntegracao: boolean = false;

  public exibeListaEtapasIntegracao: boolean = false;

  public mapSubUser : {[index:string] : string} = {};

  @ViewChild('enviarProjetoModal') enviarProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('autuarConfirmacaoProjetoModal') confirmarIntegracaoProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('confirmarRevisarProjetoModal') confirmarRevisarProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('confirmarArquivarProjetoModal') confirmarArquivarProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('informarComplementacoesProjetoModal') informarComplementacoesProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('autuarConfirmacaoReentramentoDicProjetoModal') confirmarIntegracaoReentranharProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('enviarParecerProjetoModal') enviarParecerProjetoModalTemplate: TemplateRef<any> | undefined;

  @ViewChild('efetivarParecerProjetoModal') efetivarParecerProjetoModalTemplate: TemplateRef<any> | undefined;
  @ViewChild('entranharPareceresEdocsProjetoModal') entranharPareceresEdocsProjetoModalTemplate: TemplateRef<any> | undefined;

  // otimizacao carga agentes goves.. 
  pessoas$: Observable<IOpcoesDropdownResponsavelProponente[]> = of([]);
  input$ = new Subject<string>();

  StatusParecerEnum = StatusParecerEnum;

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
    private router: Router,
    private cdr: ChangeDetectorRef,
    public parecerService: ParecerService
  ) {

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
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
      .pipe(tap((response) => {
        this.tiposPapelOpcoes = response;
        const idsPermitidos = [
          TipoPapelEnum.Gerente_de_Projeto,
          // TipoPapelEnum.Redator,
          TipoPapelEnum.Membro_do_Projeto
        ];
        this.tiposPapelOpcoesVisiveis = response.filter(papel => idsPermitidos.includes(papel.id));
      }
      ));

    this._getTiposMotivosArquivamentoOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposArquivamento()
      .pipe(tap((response) => {
        this.tiposMotivoArquivamentoOpcoes = response;
      }));

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
          // console.log("Buscar projeto por ID: ", JSON.stringify(response, null, 2))
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

          this.mostrarBotaoPedirRevisaoDic = false;

          this.statusProjeto = projetoModel.status;
          this.lotacaoGestorProjeto = projetoModel.lotacaoProponenteResponsavel;
          this.nomeProponenteResponsavel = projetoModel.nomeProponenteResponsavel;
          this.podeEditar = projetoModel.podeEditar;
          this.podeSoilictarComplementacao = projetoModel.podeSolicitarComplementacao;
          this.podeResponderComplementacao = projetoModel.podeResponderComplementacao;
          this.camposComplementarProjeto = projetoModel.camposComplementar;
          this.subProponenteDIC = projetoModel.subProponente;
          this.nomeProponenteDIC = projetoModel.nomeProponente

          this.statusProjetoOpcoes = Object.values(StatusProjetoEnum).filter(
            (status) => status != this.statusProjeto
          );

          this.iniciarForm(projetoModel);

          this._idProjetoEdicao = projetoModel.id;

          this.mostrarBotaoBaixarDic = !projetoModel.rascunho;

          this.equipeProjeto = projetoModel.equipeElaboracao;

          this.isUsuarioProponenteResponsavel = projetoModel.subResponsavelProponente === this._usuarioService.usuarioPerfil.subNovo;

          this.parecerProjetoUsuario = projetoModel.parecerProjetoUsuario;
          this.lotacaoUsuario = projetoModel.lotacaoUsuario;
          this.pareceresProjeto = projetoModel.pareceresProjeto;

          this.projetoForm.setControl('pareceresProjeto',
            this._nnfb.array(projetoModel.pareceresProjeto || [])
          );

          // 
          if (projetoModel.status === StatusProjetoEnum.Arquivado) {
            this.mostrarBotaoBaixarDic = false;
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

          if (emElaboracaoSemProtocolo && this.subProponenteDIC != projetoModel.subResponsavelProponente && this._usuarioService.usuarioPerfil.subNovo == projetoModel.subResponsavelProponente) {
            this.mostrarBotaoPedirRevisaoDic = true
          } else {
            this.mostrarBotaoPedirRevisaoDic = false
          }

          if (this.podeResponderComplementacao) {
            this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
              this._projetosService.gerarBotoesAcaoResponderComplementacao(this.podeEditar)
            );
            setTimeout(() => this.trocarModo(true), 2000);
          } else {
            if (this.isProponente) {
              if (emElaboracaoSemProtocolo && this.isUsuarioProponenteResponsavel) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnalise()
                );
              } else if (projetoModel.protocoloEdocs) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao(this.podeSoilictarComplementacao)
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
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao(this.podeSoilictarComplementacao)
                );
                this.trocarModo(false);
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormulario()
                );
                setTimeout(() => this.trocarModo(true), 2000);
              }
            }

            if (projetoModel.status === StatusProjetoEnum.Parecer_SEP) {

              this.mostrarBotaoBaixarDic = false;

              const subeppSubeoEnviados = this.pareceresEstrategicoOrcamentarioForamEnviados();

              const subeppSubeoEntranhados = this.pareceresEstrategicoOrcamentarioForamEntranhados();

              this._breadcrumbService.listaItemsBreadcrumb$

              const parecerSubcapGeoc = this.pareceresProjeto
                .find(p => [LotacaoUsuarioEnum.SUBCAP].includes(p.parecerLotacao))

              if ((this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEPP || this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEO) &&
                (!this.parecerProjetoUsuario.guidDocumentoEdocs || this.parecerProjetoUsuario.guidDocumentoEdocs.length == 0)) {

                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoParecerEstrategicoOrcamentario()
                );

              } else if ( ( !parecerSubcapGeoc && subeppSubeoEntranhados) || 
                ( parecerSubcapGeoc && parecerSubcapGeoc?.statusParecer !== StatusParecerEnum.Entranhado_Processo_Edocs ) ) {

                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoParecerGEOC()
                );

              } else if (this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP && subeppSubeoEnviados && !subeppSubeoEntranhados) {

                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoEntgranharPareceresProcessoEdocs()
                );

              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoeAcaoVoltar()
                );
              }

              setTimeout(() => this.trocarModo(true), 2000);

            }

          }

          // usa uma flag vinda da API informando se o DIC pode ser Editado.. 
          setTimeout(() => this.trocarModo(this.podeEditar), 2000);

          this.loading = false;
          this.isLoadingPessoas = false;

        })

      );
  }

  private pareceresEstrategicoOrcamentarioForamEnviados(): boolean {

    const pareceresFiltrados = this.pareceresProjeto
      .filter(p =>
        [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP]
          .includes(p.parecerLotacao)
      );

    const temSubeo = pareceresFiltrados
      .some(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEO);

    const temSubepp = pareceresFiltrados
      .some(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEPP);

    const todosEnviados =
      pareceresFiltrados.length > 0 &&
      pareceresFiltrados.every(p => p.guidDocumentoEdocs?.length > 0);

    return temSubeo && temSubepp && todosEnviados;

  }

  private pareceresEstrategicoOrcamentarioForamEntranhados(): boolean {

    const pareceresFiltrados = this.pareceresProjeto
      .filter(p =>
        [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP]
          .includes(p.parecerLotacao)
      );

    const entranhouSubeo = pareceresFiltrados
      .some(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEO);

    const entranhouSubepp = pareceresFiltrados
      .some(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEPP);

    const todosEntranhados =
      pareceresFiltrados.length > 0 &&
      pareceresFiltrados.every(p => p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs);

    return entranhouSubeo && entranhouSubepp && todosEntranhados;

  }

  public deveComplementarCampo(nomeControle: string): boolean {
    const deveComplementar = this.camposComplementarProjeto.some(
      campo => campo.idCampo === nomeControle
    );
    return (this.statusProjeto == StatusProjetoEnum.Em_Complementacao && deveComplementar) || false;
  }


  public mensagemComplementarCampo(nomeControle: string): string {
    const campoEncontrado = this.camposComplementarProjeto.find(
      campo => campo.idCampo === nomeControle
    );
    return campoEncontrado ? campoEncontrado.descricaoComplemento : '';
  }

  public aguardandoParecer(): boolean {

    return (this.statusProjeto == StatusProjetoEnum.Parecer_SEP) || this.isProjetoElegivel();

  }

  public isProjetoElegivel() : boolean {
    return this.statusProjeto == StatusProjetoEnum.Elegivel;
  }
  

  ngOnInit(): void {

    const camposPedidoComplementacao: Record<string, string> = {
      sigla: 'Sigla',
      titulo: 'Título',
      idOrganizacao: 'Organização',
      quantia: 'Valor Estimado',
      moeda: 'Moeda',
      tipo: 'Tipo Valor',
      rateio: 'Rateio',
      objetivo: 'Objetivo',
      objetivoEspecifico: 'Objetivo Específico',
      situacaoProblema: 'Situação Problema',
      solucoesPropostas: 'Soluções Propostas',
      impactos: 'Impactos',
      arranjosInstitucionais: 'Arranjos Institucionais',
      equipeElaboracao: 'Equipe de Elaboração',
      indicadoresProjeto: 'Indicadores do Projeto',
      acoesProjeto: 'Ações do Projeto',
      pecasPlanejamento: 'Peças de Planejamento',
      subResponsavelProponente: 'Responsável Proponente'
    };

    this.camposParaComplementacao = Object.entries(camposPedidoComplementacao)
      .map(([control, label]) => ({
        name: control,
        label,
        mensagemComplementacao: ''
      })) as IEstruturaCamposComplementar[];

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

        this.mostrarBotaoBaixarDic = false;
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

    var valorIdOrganizacao = idOrganizacaoFormControl.value;

    if (valorIdOrganizacao == null)
      valorIdOrganizacao = this.usuario_IdOrganizacoes[0];

    idOrganizacaoFormControl.patchValue(valorIdOrganizacao);

    this.isLoadingPessoas = true;

    this._pessoasService.buscarResponsavelPorIdOrganizacaoAC(valorIdOrganizacao)
      .subscribe({
        next: (response) => {

          this.pessoasOpcoes = response;
          this.isLoadingPessoas = false;

          const subResponsavelProponente = this.projetoForm.get('subResponsavelProponente')?.value
          const pessoa = this.pessoasOpcoes.find(p => p.agentePublicoSub === subResponsavelProponente);
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
      (reject) => { }
    );
  }

  public async idMembroNgSelectChangeEvent(event: IOpcoesDropdownResponsavelProponente): Promise<void> {

    const subResponsavelProponente = this.projetoForm.get(
      'subResponsavelProponente'
    ) as FormControl<string | null>

    const jaExiste = this.equipeService.equipeFormArray.value.some(
      (membro) => (membro.subPessoa === event.agentePublicoSub && membro.idStatus === TipoStatusEnum.Ativo)
    ) || event.agentePublicoSub === subResponsavelProponente.value || this._usuarioService.usuarioPerfil.subNovo === event.agentePublicoSub;

    if (jaExiste) {
      this._toastService.showToast(
        'info',
        'Pessoa já incluso na equipe',
      );
    } else {
      this.equipeService.idMembroNgSelectValue$.next(event);
    }

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
      ),
      enviarProjetoPedirParecer: this._nnfb.control(
        projetoFormModel?.enviarProjetoPedirParecer ?? false,
      ),
      parecerProjetoUsuario: this._nnfb.group({
        id: [projetoFormModel?.parecerProjetoUsuario?.id ?? null],
        idProjeto: [projetoFormModel?.parecerProjetoUsuario?.idProjeto ?? null],
        statusParecer: [projetoFormModel?.parecerProjetoUsuario?.statusParecer ?? null],
        textoParecer: [projetoFormModel?.parecerProjetoUsuario?.textoParecer ?? ''],
        dataEnvioParecer: [projetoFormModel?.parecerProjetoUsuario?.dataEnvio ?? null],
        guidDocumentoEdocs: [projetoFormModel?.parecerProjetoUsuario?.guidDocumentoEdocs ?? ''],
        guidUnidadeOrganizacao: [projetoFormModel?.parecerProjetoUsuario?.guidUnidadeOrganizacao ?? ''],
        usuarioFezEnvioParecer: [projetoFormModel?.parecerProjetoUsuario?.usuarioFezEnvioParecer ?? '']
      }),
      pareceresProjeto: this._nnfb.array([]),
    });

    const mapSubObs : {[index: string]: Observable<string>} = {};
    projetoFormModel?.pareceresProjeto?.forEach(parecer => {
        mapSubObs[parecer.usuarioFezEnvioParecer] = this._pessoasService.buscarMeuPerfil(parecer.usuarioFezEnvioParecer)
                                                    .pipe(map(pessoa => pessoa.nome))
    })

    forkJoin(mapSubObs).subscribe(retorno => this.mapSubUser = retorno);

    this.carregarPessoasPorOrganizacao();

    this.projetoFormValueChanges();

    this.valorFormValueChanges();

    if (this.isProponente && !projetoFormModel)
      this.usuarioProponenteValoresIniciaisProjetoForm();

  }

  private usuarioProponenteValoresIniciaisProjetoForm(): void {

    const idOrganizacaoFormControl = this.projetoForm.get('idOrganizacao') as FormControl<number | null>;

    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);

    const indexGestor = this.pessoasOpcoes.findIndex(pessoa => pessoa.gestorOrganizacao === true);

    if (indexGestor > 0) {
      this.projetoForm.patchValue({
        idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
        nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toLowerCase,
        papelResponsavelProponente: this.pessoasOpcoes[indexGestor].papelPrioritario,
        subResponsavelProponente: this.pessoasOpcoes[indexGestor].agentePublicoSub
      });
    } else {
      if (this.pessoasOpcoes.length > 0) {
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
      moedaFormControl.disable();
    }

    if (!tipoFormControl.value) {
      tipoFormControl.patchValue(TipoValorEnum.Estimado);
      tipoFormControl.disable();
    }

    quantiaFormControl.valueChanges.subscribe((quantiaValue) => {
      this._rateioService.quantiaFormControlReferencia$.next(quantiaValue);
    });

    this.inicializarParecer();

  }

  private inicializarParecer(): void {

    const parecerFormGroup = this.projetoForm.get('parecerProjetoUsuario') as FormGroup | null;

    if (!parecerFormGroup) {
      console.warn('parecerProjeto não encontrado no formulário principal.');
      return;
    }

    const parecerAtual = parecerFormGroup.getRawValue();

    if (!parecerAtual.id && !parecerAtual.textoParecer) {
      parecerFormGroup.patchValue({
        id: null,
        idProjeto: this.projetoForm.get('id')?.value ?? null,
        statusParecer: StatusParecerEnum.Pendente,
        textoParecer: '',
        dataEnvioParecer: null,
        guidDocumentoEdocs: '',
        guidUnidadeOrganizacao: ''
      });
    }

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

    if (!subResponsavelProponenteValor) {

      this._pessoasService
        .buscarResponsavelPorIdOrganizacaoAC(idOrganizacaoValue)
        .subscribe({
          next: (response) => {
            this.pessoasOpcoes = this.pessoasOpcoesFiltrada = response;
            this.isLoadingPessoas = false;

            const indexGestor = this.pessoasOpcoes.findIndex(
              pessoa => pessoa.gestorOrganizacao === true
            );

            if (indexGestor > 0) {
              this.projetoForm.patchValue({
                idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
                nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toUpperCase(),
                papelResponsavelProponente: this.pessoasOpcoes[indexGestor].papelPrioritario,
                subResponsavelProponente: this.pessoasOpcoes[indexGestor].agentePublicoSub
              });
            } else {
              if (this.pessoasOpcoes.length > 0) {
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

    } else {
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
          enviarProjetoGestor: true
        });
        if (!this.validarFormulario(this.projetoForm))
          break;
        this.validacaoSomaValoresAcoesEnviar(this.projetoForm, false);
        break;

      case BreadcrumbAcoesEnum.AssinarAutuar:

        this.projetoForm.patchValue({
          autuarConfirmacaoProjetoModal: true,
          enviarProjetoGestor: false
        });

        const controlJustificativaRevisao = this.projetoForm.get('justificativaRevisao');
        controlJustificativaRevisao?.clearValidators();
        controlJustificativaRevisao?.updateValueAndValidity();

        const controlJustificativaArquivamento = this.projetoForm.get('justificativaArquivamento');
        controlJustificativaArquivamento?.clearValidators();
        controlJustificativaArquivamento?.updateValueAndValidity();

        const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento');
        codigoMotivoArquivamento?.clearValidators();
        codigoMotivoArquivamento?.updateValueAndValidity();

        if (!this.validarFormulario(this.projetoForm))
          break;

        if (this.compararValorEstimadoValorAcoes()) {
          if (this.statusProjeto == StatusProjetoEnum.Em_Complementacao)
            this.abrirConfirmarIntegracapEdocsModalReentranharDic(this.projetoForm)
          else
            this.abrirConfirmarIntegracapEdocsModal(this.projetoForm)
        }
        break;

      case BreadcrumbAcoesEnum.Voltar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Projetos
        );
        break;

      case BreadcrumbAcoesEnum.Arquivar:
        this.abrirArquivarModal(this.projetoForm)
        break;

      case BreadcrumbAcoesEnum.Complementar:
        this.abrirComplementacaoModal()
        break;

      case BreadcrumbAcoesEnum.EnviarPedindoParecerEstrategicoOrcamentario:
        this.projetoForm.patchValue({
          enviarProjetoPedirParecer: true
        });
        if (!this.validarFormulario(this.projetoForm))
          break;
        this.validacaoSomaValoresAcoesEnviarParecer(this.projetoForm, false);
        break;

      case BreadcrumbAcoesEnum.EnviarEfetivacaoParecerEstrategicoOrgamentario:
        this.abrirEfetivarParecerModal()
        break;

      case BreadcrumbAcoesEnum.EntranharPareceresProcessoEdocs:
        this.abrirEntranhamentoPareceresModal()
        break;

      case BreadcrumbAcoesEnum.CapturarparecerGEOC:
        this.abrirEfetivarParecerModal()
        break;

    }

  }

  private validacaoSomaValoresAcoesEnviar(form: FormGroup, isRascunho: boolean): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.abrirConfirmarEnvioMembroModal(form)
    }
  }

  private validacaoSomaValoresAcoesEnviarParecer(form: FormGroup, isRascunho: boolean): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.abrirConfirmarEnvioParecerModal(form)
    }
  }

  private compararValorEstimadoValorAcoes(): boolean {

    const valorEstimadoProjeto = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number>;

    const valorFormGroup = this.projetoForm.get('valor') as FormGroup<ValorFormType>;
    const quantiaFormControl = valorFormGroup.get('quantia') as FormControl<number | null>;
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

    if (Math.abs(valorSomaAcoes - valorEstimadoTotal) < 0.001) {
      return true;
    }

    this._toastService.showToast('error', 'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.',
      ['A soma dos valores estimado das ações deve ser igual ao valor estimado do projeto.',]);

    return false;

  }

  private trocarModo(permitir: boolean): void {

    this.isModoEdicao = permitir;
    const projetoFormControls = this.projetoForm.controls;

    alterarEstadoControlesFormulario(permitir, projetoFormControls);

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    this.projetoForm.get('valor.tipo')?.disable();

    // moeda não será permitido mudar de Real para outra moeda..
    this.projetoForm.get('valor.moeda')?.disable();

    // Caso especifico para os campos de justificativa (revisao e arquivamento ) na autuacao de projeto..
    this.projetoForm.get('justificativaRevisao')?.enable();
    this.projetoForm.get('justificativaArquivamento')?.enable();
    this.projetoForm.get('codigoMotivoArquivamento')?.enable();

    const textoParecerFormControl = this.projetoForm.get(
      'parecerProjetoUsuario.textoParecer'
    ) as FormControl<string | null>;

    const idDocumentoEdocsFormControl = this.projetoForm.get(
      'parecerProjetoUsuario.guidDocumentoEdocs'
    ) as FormControl<string | null>;

    if (this.statusProjeto === StatusProjetoEnum.Parecer_SEP || this.statusProjeto === StatusProjetoEnum.Elegivel ) {

      setTimeout(() => {
        const idDocumentoEdocsParecer = idDocumentoEdocsFormControl?.value ?? '';
        if (idDocumentoEdocsParecer.length > 0)
          textoParecerFormControl.disable({ emitEvent: false });
        else
          textoParecerFormControl.enable({ emitEvent: false });
      });

    }

  }

  public isSubcapGeoc(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP;
  }

  public isGeocEditavel() : boolean {
    const subeoSubeppEntranhados = this.pareceresProjeto.length > 0 &&
      this.pareceresProjeto
        .filter(p =>
          [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(p.parecerLotacao)
        )
        .every(p => p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs);
    return this.statusProjeto === StatusProjetoEnum.Parecer_SEP && this.isSubeoSubeppEntranhados();
  }

  public isSubeoSubeppEntranhados() : boolean {
    const subeoSubeppEntranhados = this.pareceresProjeto.length > 0 &&
      this.pareceresProjeto
        .filter(p =>
          [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(p.parecerLotacao)
        )
        .every(p => p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs);
    return subeoSubeppEntranhados;
  }

  private validarFormulario(form: FormGroup): boolean {

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

    // valida se tem pelo menos uma acao ATIVA no form
    // e seja diferente do papel 'Redator'
    const membrosEquipeAtivas = this.projetoForm.get('equipeElaboracao')?.value
      .filter((membro: EquipeModel) => membro.idStatus === TipoStatusEnum.Ativo && membro.idPapel != TipoPapelEnum.Redator);

    if (membrosEquipeAtivas.length === 0) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Nenhum membro informado além do Redator.',
      ]);
      return false;
    }

    return true;

  }

  getLotacao(nLotacao: number) {
    switch(nLotacao) {
      case LotacaoUsuarioEnum.SUBCAP: return "GEOC";
      case LotacaoUsuarioEnum.SUBEO: return "Orçamentário";
      case LotacaoUsuarioEnum.SUBEPP: return "Estratégico";
    }
    return undefined;
  }

  get demaisPareceres() {
    
    return [LotacaoUsuarioEnum.SUBEPP, LotacaoUsuarioEnum.SUBEO, ...(this.isSubeoSubeppEntranhados() ? [LotacaoUsuarioEnum.SUBCAP] : [])]
            .map(n => {
              const parecer = this.pareceresProjeto.filter(p => p.parecerLotacao === n)[0]

              return parecer ?? {
                parecerLotacao: n
              } as IParecer;

            })
            .filter(parecer =>!this.aguardandoParecer() || this.isProjetoElegivel() || parecer.parecerLotacao !== this.lotacaoUsuario)
  }

  private submitProjetoForm(form: FormGroup, isRascunho: boolean): void {

    if (this.statusProjeto === StatusProjetoEnum.Parecer_SEP || this.statusProjeto === StatusProjetoEnum.Elegivel ) {

      const parecerControl = this.projetoForm.get('parecerProjetoUsuario') as FormGroup;

      if (parecerControl.invalid) {
        parecerControl.markAllAsTouched();
        return;
      }

      const payload = new ProjetoFormModel(this.projetoForm.getRawValue() as IProjetoForm);

      payload.parecerProjetoUsuario = this.projetoForm.get('parecerProjetoUsuario')?.getRawValue();

      this.atualizarProjeto(payload, isRascunho).subscribe();

    } else {

      if (this.validarFormulario(form)) {

        // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
        form.get('valor.tipo')?.enable();

        // Caso especifico de Projetos; moeda somente pode ser 'Real'
        form.get('valor.moeda')?.enable();

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

  }

  onSelecionarOrganizacao(organizacao: any) {

    this.projetoForm.patchValue({
      idResponsavelProponente: null,
      nomeResponsavelProponente: '',
      papelResponsavelProponente: '',
      subResponsavelProponente: ''
    });

    this.lotacaoGestorProjeto = '';

    this.idOrganizacaoChange(organizacao);

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

    if (termo.length < 3) {
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
            !this.equipeProjeto.some(membro => membro.idStatus === TipoStatusEnum.Inativo && membro.subPessoa === pessoa.agentePublicoSub)
          );

          if (this.pessoasOpcoesGoves.length === 0) {
            this._toastService.showToast(
              'info',
              'Nenhum agente encontrado.',
              ['Verifique se já faz parte da equipe.']);
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

  public abrirConfirmarEnvioMembroModal(form: FormGroup
  ) {

    this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';

    const modalRef = this._ngbModalService.open(this.enviarProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirmado') {
          this.submitProjetoForm(form, false);
        }
      },

    );

  }

  public abrirConfirmarEnvioParecerModal(form: FormGroup) {

    this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';

    const modalRef = this._ngbModalService.open(this.enviarParecerProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirmado') {
          this.submitProjetoForm(form, false);
        }
      },

    );

  }

  public abrirRevisarModal(form: FormGroup
  ) {

    const controlJustificativaRevisao = form.get('justificativaRevisao');
    controlJustificativaRevisao?.setValidators([Validators.required, Validators.maxLength(200)]);
    controlJustificativaRevisao?.updateValueAndValidity();

    const modalRef = this._ngbModalService.open(this.confirmarRevisarProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {

        if (result === 'confirmado') {
          this.enviarProjetoRevisaoForm(this.projetoForm);
        }

      },

    );

  }

  public abrirArquivarModal(form: FormGroup) {

    const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento');
    codigoMotivoArquivamento?.setValidators([Validators.required, Validators.maxLength(200)]);
    codigoMotivoArquivamento?.updateValueAndValidity();

    const modalRef = this._ngbModalService.open(this.confirmarArquivarProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(

      (result) => {
        if (result === 'confirmado') {
          this.enviarProjetoArquivamentoForm();
        }
      },

    );

    this.projetoForm.get('codigoMotivoArquivamento')?.patchValue(null);
    this.projetoForm.get('justificativaArquivamento')?.patchValue(null);

  }

  public validarEnvioArquivamento(modal: NgbActiveModal) {

    if (this.projetoForm.invalid) {
      this.projetoForm.markAllAsTouched();
      return;
    }

    modal.close('confirmado');

  }


  private abrirConfirmarIntegracapEdocsModalReentranharDic(form: FormGroup
  ) {

    this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';

    const modalRef = this._ngbModalService.open(this.confirmarIntegracaoReentranharProjetoModalTemplate, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

  }

  private abrirConfirmarIntegracapEdocsModal(form: FormGroup
  ) {

    this.nomeProponenteResponsavel = this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() || '-';

    const modalRef = this._ngbModalService.open(this.confirmarIntegracaoProjetoModalTemplate, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

  }

  public confirmarAssinarAutuar() {

    this.autuacaoAcionada = true;
    this.assinarAutuar = false;
    this.finalizadoProcessamentoIntegracao = false;

    if (this.statusProjeto === StatusProjetoEnum.Em_Complementacao) {
      this.reentranharDicProjetoForm(this.projetoForm);
    } else {
      this.autuarProjetoForm(this.projetoForm);
    }

  }

  public confirmarAssinarCapturarParecer() {
    this.autuacaoAcionada = true;
    this.assinarAutuar = false;
    this.finalizadoProcessamentoIntegracao = false;
    this.efetivarEnvioParecerProjetoForm(this.projetoForm);
  }

  public confirmarEntranhamentoParecerProcessoEdocs() {
    this.autuacaoAcionada = true;
    this.assinarAutuar = false;
    this.finalizadoProcessamentoIntegracao = false;
    this.efetivarEntranhamentoPareceresProjetoForm(this.projetoForm);
  }

  private reentranharDicProjetoForm(form: FormGroup): void {

    form.updateValueAndValidity();

    setTimeout(() => {
      form.get('valor.tipo')?.enable();
      form.get('valor.moeda')?.enable();
      const payload = new ProjetoFormModel(form.value as IProjetoForm);
      payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;
      this.reentranharDicProjetoAsync(payload);
    });

  }

  public confirmarEnvioPedidoPareceres() {
    this.autuarProjetoForm(this.projetoForm);
  }

  private autuarProjetoForm(form: FormGroup): void {

    form.updateValueAndValidity();
    setTimeout(() => {
      form.get('valor.tipo')?.enable();
      form.get('valor.moeda')?.enable();
      const payload = new ProjetoFormModel(form.value as IProjetoForm);
      payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;
      this.autuarProjetoAsync(payload);
    });

  }

  private efetivarEnvioParecerProjetoForm(form: FormGroup): void {

    form.updateValueAndValidity();

    form.get('valor.tipo')?.enable();
    form.get('valor.moeda')?.enable();

    const payload = new ProjetoFormModel(form.getRawValue() as IProjetoForm);

    payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;

    this.efetivarEnvioParecerProjetoAsync(payload);

  }

  private efetivarEntranhamentoPareceresProjetoForm(form: FormGroup): void {

    form.updateValueAndValidity();

    form.get('valor.tipo')?.enable();
    form.get('valor.moeda')?.enable();

    const payload = new ProjetoFormModel(form.getRawValue() as IProjetoForm);

    payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;

    this.efetivarEntranhamentoPareceresProjetoAsync(payload);

  }

  private enviarProjetoRevisaoForm(form: FormGroup): void {

    this._projetosService
      .enviarEmailRevisarProjeto(this._idProjetoEdicao, this.projetoForm.get('justificativaRevisao')?.value)
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

  private enviarProjetoArquivamentoForm(): void {

    const textoJustificativa = this.projetoForm.get('justificativaArquivamento')?.value
    const codigoMotivoArquivamento = this.projetoForm.get('codigoMotivoArquivamento')?.value

    this._projetosService
      .enviarEmailArquivarProjeto(this._idProjetoEdicao, textoJustificativa, codigoMotivoArquivamento)
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

  private enviarProjetoComplementacao(): void {

    if (!this.camposParaComplementacao.some(campo => campo.mensagemComplementacao?.length ?? 0 > 0)) {
      this._toastService.showToast('error', 'Nenhum complemento informado.');
      return;
    }

    this._projetosService.enviarEmailAvisoComplementacaoProjeto(
      this._idProjetoEdicao,
      this.camposParaComplementacao
    )
      .pipe(
        tap(() => {
          this._toastService.showToast(
            'info',
            'Envio de aviso de complementação iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this._toastService.showToast(
            'error',
            'Erro ao iniciar o envio de aviso de complementação.'
          );
          return of([]);
        }),

        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })

      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal(ContextoIntegracaoEdocsEnum.Complementar);
      });

  }

  private reentranharDicProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService.reentranharDicEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo reentranhar DIC com correções iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this.autuacaoAcionada = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.'
          );
          return of([]);
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal(ContextoIntegracaoEdocsEnum.Complementar);
      });

  }

  private autuarProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService.autuarProjetoEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de autuação iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this.autuacaoAcionada = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.'
          );
          return of([]);
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal(ContextoIntegracaoEdocsEnum.Autuacao);
      });

  }

  private efetivarEnvioParecerProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService.efetivarEnvioParecerEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de autuação iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this.autuacaoAcionada = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.'
          );
          return of([]);
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal(ContextoIntegracaoEdocsEnum.Autuacao);
      });

  }

  private efetivarEntranhamentoPareceresProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService.efetivarEntranhamentoPareceresProjetoEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de entranhamento de pareceres do DIC iniciado no E-Docs.'
          );
        }),
        catchError(error => {
          this.autuacaoAcionada = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar entranhamento de pareceres do DIC no E-Docs.'
          );
          return of([]);
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        })
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal(ContextoIntegracaoEdocsEnum.CapturaAsinaturaParecer);
      });

  }

  private pararPolling$ = new Subject<void>();

  private iniciarPollingEtapasIntegracaoModal(
    contexto: ContextoIntegracaoEdocsEnum
  ): void {

    const INTERVALO = 2000;

    interval(INTERVALO).pipe(

      switchMap(() =>
        this._projetosService
          .consultarFasesIntegracaoEdcosProjeto(this._idProjetoEdicao)
          .pipe(
            tap(response => {
              // console.log('Response da API:', response);
            }),
            map(response =>
              response.map(fase => new ProjetoIntegracaoEdocsFasesModel(fase))
            ),
            catchError(err => {
              console.error('Erro na requisição', err);
              return of([]);
            })
          )
      ),

      filter(lista => lista.length > 0),

      tap(lista => this.atualizarStatusUI(lista)),

      tap(lista => {
        const faseComErro = lista.find(f => f.erro);
        if (faseComErro) {
          this.tratarErro(faseComErro);
          this.pararPolling$.next();
        }
      }),

      filter(lista => lista.every(fase => fase.finalizada)),

      take(1),

      tap(() => {
        this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);
        this._projetosService.notificarAtualizacaoLista();
        this.pararPolling$.next();
        this.assinarAutuar = false;
        this.finalizadoProcessamentoIntegracao = true;
        this.autuacaoAcionada = false;
      }),

      takeUntil(this.pararPolling$),

      finalize(() => {
        this.autuacaoAcionada = false;
        this.cdr.detectChanges();
      })

    ).subscribe();

  }

  private atualizarStatusUI(lista: ProjetoIntegracaoEdocsFasesModel[]) {
    lista.forEach(fase => {
      switch (fase.etapa) {
        case FasesEdocsIntegracaoEnum.captura_assinatura:
          if (fase.erro) {
            this.aguardandoAssinatura = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada && !fase.finalizada)
            this.aguardandoAssinatura = FaseStatuEnum.EM_ANDAMENTO;
          if (fase.iniciada && fase.finalizada) {
            this.aguardandoAssinatura = FaseStatuEnum.FINALIZADA;
          }
          break;
        case FasesEdocsIntegracaoEnum.autuar:
          if (fase.erro) {
            this.aguardandoAutuacao = FaseStatuEnum.ERROFASE;
            this.aguardandoEntranhamento = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada) {
            this.aguardandoAutuacao = FaseStatuEnum.EM_ANDAMENTO;
            this.aguardandoEntranhamento = FaseStatuEnum.EM_ANDAMENTO;
          }
          if (fase.finalizada) {
            this.aguardandoAutuacao = FaseStatuEnum.FINALIZADA;
            this.aguardandoEntranhamento = FaseStatuEnum.FINALIZADA;
          }
          break;
        case FasesEdocsIntegracaoEnum.despacharprocesso:
          if (fase.erro) {
            this.aguardandoDespacho = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada)
            this.aguardandoDespacho = FaseStatuEnum.EM_ANDAMENTO;
          if (fase.finalizada)
            this.aguardandoDespacho = FaseStatuEnum.FINALIZADA;
          break;
        case FasesEdocsIntegracaoEnum.desentranhamento:
          if (fase.erro) {
            this.aguardandoDesentranhamento = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada)
            this.aguardandoDesentranhamento = FaseStatuEnum.EM_ANDAMENTO;
          if (fase.finalizada)
            this.aguardandoDesentranhamento = FaseStatuEnum.FINALIZADA;
          break;
        case FasesEdocsIntegracaoEnum.avocamento:
          if (fase.erro) {
            this.aguardandoAvocamento = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada)
            this.aguardandoAvocamento = FaseStatuEnum.EM_ANDAMENTO;
          if (fase.finalizada)
            this.aguardandoAvocamento = FaseStatuEnum.FINALIZADA;
          break;
        case FasesEdocsIntegracaoEnum.entranhararquivo:
          if (fase.erro) {
            this.aguardandoEntranhamento = FaseStatuEnum.ERROFASE;
            break;
          }
          if (fase.iniciada) {
            this.aguardandoEntranhamento = FaseStatuEnum.EM_ANDAMENTO;
          }
          if (fase.finalizada) {
            this.aguardandoEntranhamento = FaseStatuEnum.FINALIZADA;
          }
          break;
      }
    }
    )
  };

  private tratarErro(fase: ProjetoIntegracaoEdocsFasesModel): void {

    this.autuacaoAcionada = false;
    this.erroEmAlgumaFaseModalAutuacao = true;

    if ((fase.msgAlertaExibir?.length ?? 0) > 0) {
      this._toastService.showToast(
        'warning',
        fase.msgAlertaExibir
      );
    } else {
      this._toastService.showToast(
        'error',
        'Ocorreu erro na integração com o E-Docs.'
      );
    }

    this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);

    this.pararPolling$.next();

    this.cdr.detectChanges();

  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
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

    if (codigoMotivoArquivamento?.value == null || codigoMotivoArquivamento?.value?.trim() === '') {
      this._toastService.showToast(
        'error',
        'Informe o motivo para arquivamento.'
      );
      return;
    }

    // se clicar na opcao outros obriga o preenchimento da justificativa.
    if (codigoMotivoArquivamento?.value?.trim() === 'M11') {
      controlJustificativaArquivamento?.setValidators([Validators.required, Validators.maxLength(200)]);
      controlJustificativaArquivamento?.updateValueAndValidity();
      if ((!controlJustificativaArquivamento || controlJustificativaArquivamento.invalid || !controlJustificativaArquivamento.value?.trim())) {
        controlJustificativaArquivamento?.markAsTouched();
        return;
      }

    }

    modal.close('confirmado');

  }

  public iconeClasse(faseIntegracao: FasesEdocsIntegracaoEnum): string {
    return this.erroNaFaseIntegracao(faseIntegracao)
      ? 'fa-solid fa-circle-xmark text-danger'
      : 'fa-solid fa-circle-xmark text-warning';
  }

  private erroNaFaseIntegracao(faseIntegracao: FasesEdocsIntegracaoEnum): boolean {
    return this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.some(fase => fase.etapa == faseIntegracao && fase.erro && (fase.msgAlertaExibir?.length ?? 0) == 0);
  }

  public possuiMensagemAlerta(): boolean {
    return this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.some(fase => fase.erro && (fase.msgAlertaExibir?.length ?? 0) == 0);
  }

  public classeCssMensagemAlerta(): string {
    return this.possuiMensagemAlerta()
      ? 'btn btn-danger icon-text-btn me-2 d-inline-flex align-items-center'
      : 'btn btn-warning icon-text-btn me-2 d-inline-flex align-items-center';
  }

  public isIntegracaoEdocsConcluido(): boolean {

    if (this.listaFasesIntegracaoProjeto.length > 0 && this.listaFasesIntegracaoProjeto.every(fase => fase.finalizada)) {
      return true;
    }

    return false;

  }

  public isReentramentoEdocsConcluido(): boolean {
    if (this.listaFasesIntegracaoProjeto.length > 0 && this.listaFasesIntegracaoProjeto.every(fase => fase.finalizada))
      return true;
    return false;
  }

  confirmarComplementacao(modal: NgbModalRef): void {

    modal.close('confirmado');

  }

  public abrirComplementacaoModal() {

    const modalRef = this._ngbModalService.open(this.informarComplementacoesProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirmado') {
          this.enviarProjetoComplementacao();
        }
      },

    );

  }

  public abrirEfetivarParecerModal() {

    const parecerControl = this.projetoForm.get('parecerProjetoUsuario') as FormGroup;

    if (parecerControl.invalid) {
      parecerControl.markAllAsTouched();
      if (!this.validarFormulario(parecerControl))
        return;
    }

    const modalRef = this._ngbModalService.open(this.efetivarParecerProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirmado') {
          this.confirmarAssinarCapturarParecer();
        }
      },

    );

  }


  public abrirEntranhamentoPareceresModal() {

    const modalRef = this._ngbModalService.open(this.entranharPareceresEdocsProjetoModalTemplate, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirmado') {
          this.confirmarEntranhamentoParecerProcessoEdocs();
        }
      },

    );

  }

}
