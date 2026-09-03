import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  forkJoin,
  throwError,
} from 'rxjs';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';

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
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';
import { TipoValorEnum } from '../../../core/enums/tipo-valor.enum';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { IAcao } from '../../../core/interfaces/acoes.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
// import { EquipeModel } from '../../../core/models/equipe.model';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { ProjetoIntegracaoEdocsFasesModel } from '../../../core/models/projeto-integracao-edocs-fases.model';
import {
  FasesEdocsIntegracaoEnum,
  FaseStatuEnum,
} from '../../../core/enums/fases-edocs-integracao.enum';
import {
  IEstruturaCamposComplementar,
  IEstruturaCamposComplementarProjeto,
} from '../../../core/interfaces/estrutura.campo.complementar.dic.interface';
import { IParecer } from '../../../core/interfaces/parecer.interface';
import { ParecerService } from '../../../core/services/parecer/parecer.service';
import { StatusParecerEnum } from '../../../core/enums/status-parecer.enum';
import { LotacaoUsuarioEnum } from '../../../core/enums/lotacao-usuario.enum';
import { gerarStepStatusProjeto, IStep } from '../../../core/utils/steps';
import { IIndicadores } from '../../../core/interfaces/indicadores.interface';
import { IIndicadorAvulso } from '../../../core/interfaces/indicador-avulso.interface';
import { CatalogoIndicadorService } from '../../../core/services/catalogo-indicadores/catalogo-indicador.service';
import { IIndicadoresCatalogoExterno } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
// import { IAcaoPlanejamentoProjeto } from '../../../core/interfaces/acao-planejamento-projeto.interface';
import { AbaProjeto } from '../../../core/types/form/aba-projeto.type';
import { IPendenciaProjeto } from '../../../core/interfaces/pendencias.validacao.dic.interface';

declare var bootstrap: any;

@Component({
  selector: 'siscap-projeto-form',
  standalone: false,
  templateUrl: './projeto-form.component.html',
  styleUrl: './projeto-form.component.scss',
})
export class ProjetoFormComponent implements OnInit, OnDestroy {
  private readonly _subscription: Subscription = new Subscription();

  private _atualizarProjeto$: Observable<IProjeto> = EMPTY;
  // private _cadastrarProjeto$: Observable<number> = EMPTY;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPlanosOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getLocalidadesOpcoes$: Observable<ILocalidadeOpcoesDropdown[]>;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<any>;
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

  public statusProjeto: string = StatusProjetoEnum.Em_Elaboracao;
  public statusProjetoNovo: string | null = null;
  public statusProjetoOpcoes: Array<string> = [];
  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();
  public idMembroEquipeElaboracao: null = null;
  public idIndicadorIndicadores: null = null;
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

  public mapSubUser: { [index: string]: string } = {};

  public statusSteps?: IStep<StatusProjetoEnum>[];

  public nomeUsuario: string = '';
  public lotacaoPrioritariaUsuario: string = '';
  public processoEdocsProtocolo: string = '';

  public indicadoresProjeto: IIndicadores[] = [];
  public indicadoresAvulsosProjeto: IIndicadorAvulso[] = [];

  public textoSpinner: string = 'Carregando...';

  arquivoParecerSelecionado: File | null = null;

  private camposObrigatoriosDic = [
    'sigla',
    'titulo',
    'idOrganizacao',
    'subResponsavelProponente',
    'equipeElaboracao',
    'situacaoProblema',
    'objetivo',
    'objetivoEspecifico',
    'solucoesPropostas',
    'arranjosInstitucionais',
    'pecasPlanejamento',
    'acoesProjeto',
    'rateio',
    'indicadores',
    'ods'
  ];

  private readonly camposValidacao = [
    {
      path: 'sigla',
      campo: 'Sigla',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'titulo',
      campo: 'Título',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'idOrganizacao',
      campo: 'Organização',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'idResponsavelProponente',
      campo: 'Responsável Proponente',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'valor.quantia',
      campo: 'Valor Estimado',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'situacaoProblema',
      campo: 'Situação Problema',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'objetivo',
      campo: 'Objetivo',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'objetivoEspecifico',
      campo: 'Objetivo Específico',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'solucoesPropostas',
      campo: 'Soluções Propostas',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'arranjosInstitucionais',
      campo: 'Arranjos Institucionais',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'pecasPlanejamento',
      campo: 'Peças de Planejamento',
      aba: 'propriedades',
      nomeAba: 'DIC',
    },
    {
      path: 'impactos',
      campo: 'Impactos',
      aba: 'ods',
      nomeAba: 'ODS',
    },
  ] as const;

  public pendenciasProjeto: IPendenciaProjeto[] = [];

  public indicadoresCatalogoBI: IIndicadoresCatalogoExterno[] = [];

  public showModalPendencias: boolean = false;

  public mostrarBotaoPendenciasDic: boolean = false;

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

  accordionCollapsed = true;
  isMobile = window.innerWidth < 1200;
  subUsuario = '';

  public loadingDownload: boolean = false;
  public loadingSubmit: boolean = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1200;
  }

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
    private cdr: ChangeDetectorRef,
    public parecerService: ParecerService,
    public catalogoIndicadoresService: CatalogoIndicadorService,
    private _router: Router
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
            response.filter((localidade) => localidade.tipo == 'Microrregiao'),
          );
        }),
      );

    this._getTiposPapelOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposPapel()
      .pipe(
        tap((response) => {
          this.tiposPapelOpcoes = response;
          const idsPermitidos = [
            TipoPapelEnum.Gerente_de_Projeto,
            TipoPapelEnum.Membro_do_Projeto,
          ];
          this.tiposPapelOpcoesVisiveis = response.filter((papel) =>
            idsPermitidos.includes(papel.id),
          );
        }),
      );

    this._getTiposMotivosArquivamentoOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposArquivamento()
      .pipe(
        tap((response) => {
          this.tiposMotivoArquivamentoOpcoes = response;
        }),
      );

    this._getAllOpcoes$ = forkJoin([
      this._getOrganizacoesOpcoes$,
      this._getPlanosOpcoes$,
      this._getTiposValorOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getLocalidadesOpcoes$,
      this._getTiposMotivosArquivamentoOpcoes$,
    ]).pipe(
      finalize(
        () => (this._rateioService.localidadesOpcoes = this.localidadesOpcoes),
      ),
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao),
      ),
    );
  }

  private carregarProjetoEditar(idProjeto: number): void {

    this._atualizarProjeto$ = this._projetosService.getById(idProjeto).pipe(
      tap((response: IProjeto) => {
        // console.log("Buscar projeto por ID: ", response)
      }),
      map<IProjeto, ProjetoModel>(
        (response: IProjeto) => new ProjetoModel(response),
      ),
      catchError((error) => {
        this._toastService.showToast('error', 'Erro ao carregar projeto', [
          'Verifique se o projeto está válido.',
        ]);
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
        this.nomeProponenteDIC = projetoModel.nomeProponente;
        this.processoEdocsProtocolo = projetoModel.protocoloEdocs;

        this.statusProjetoOpcoes = Object.values(StatusProjetoEnum).filter(
          (status) => status != this.statusProjeto,
        );

        this.iniciarForm(projetoModel).subscribe(() => {

          this._idProjetoEdicao = projetoModel.id;

          this.mostrarBotaoBaixarDic = !projetoModel.rascunho;

          this.equipeProjeto = projetoModel.equipeElaboracao;

          this.isUsuarioProponenteResponsavel =
            projetoModel.subResponsavelProponente ===
            this._usuarioService.usuarioPerfil.subNovo;

          this.parecerProjetoUsuario = projetoModel.parecerProjetoUsuario;
          this.lotacaoUsuario = projetoModel.lotacaoUsuario;
          this.pareceresProjeto = projetoModel.pareceresProjeto;

          this.nomeUsuario = this._usuarioService.usuarioPerfil.nome;
          this.lotacaoPrioritariaUsuario =
            this._usuarioService.usuarioPerfil.nomeLotacaoUsuario;
          this.subUsuario = this._usuarioService.usuarioPerfil.subNovo;

          this.indicadoresProjeto = projetoModel.indicadoresProjeto;
          this.indicadoresAvulsosProjeto = projetoModel.indicadoresAvulsosProjeto;

          const caminhoFeliz = [
            StatusProjetoEnum.Em_Elaboracao,
            StatusProjetoEnum.Em_Complementacao,
            StatusProjetoEnum.Em_Analise,
            StatusProjetoEnum.Parecer_SEP,
            StatusProjetoEnum.Elegivel,
          ];

          this.statusSteps = [];

          projetoModel.historico
            .sort((s1, s2) => {
              return Date.parse(s1.inicioEm) - Date.parse(s2.inicioEm);
            })
            .forEach((h) => {
              if (!this.statusSteps) return;

              if (h.status == StatusProjetoEnum.Parecer_SEP) {
                this.statusSteps.push(
                  gerarStepStatusProjeto(
                    StatusProjetoEnum.Parecer_SEP,
                    h,
                    projetoModel.pareceresProjeto.map((p) => ({
                      ...p,
                      usuarioFezEnvioParecer:
                        this.mapSubUser[p.usuarioFezEnvioParecer],
                    })),
                    true,
                  ),
                );
              }

              this.statusSteps.push(
                gerarStepStatusProjeto(
                  h.status,
                  h,
                  projetoModel.pareceresProjeto.map((p) => ({
                    ...p,
                    usuarioFezEnvioParecer:
                      this.mapSubUser[p.usuarioFezEnvioParecer],
                  })),
                  false,
                ),
              );
            });

          if (
            ![
              StatusProjetoEnum.Elegivel,
              StatusProjetoEnum.Inelegivel,
              StatusProjetoEnum.Arquivado,
            ].includes(projetoModel.status as StatusProjetoEnum)
          ) {
            let indexUltimaEtapa = caminhoFeliz.findIndex(
              (s) => s == projetoModel.status,
            );

            if (projetoModel.status == StatusProjetoEnum.Em_Elaboracao)
              indexUltimaEtapa++;

            caminhoFeliz.slice(indexUltimaEtapa + 1).forEach((s) => {
              if (!this.statusSteps) return;

              if (s == StatusProjetoEnum.Parecer_SEP) {
                this.statusSteps.push(
                  gerarStepStatusProjeto(
                    StatusProjetoEnum.Parecer_SEP,
                    undefined,
                    projetoModel.pareceresProjeto,
                    true,
                  ),
                );
              }

              this.statusSteps.push(
                gerarStepStatusProjeto(
                  s,
                  undefined,
                  projetoModel.pareceresProjeto,
                  false,
                ),
              );
            });
          }

          this.projetoForm.setControl(
            'pareceresProjeto',
            this._nnfb.array(projetoModel.pareceresProjeto || []),
          );

          //
          if (projetoModel.status === StatusProjetoEnum.Arquivado) {
            this.mostrarBotaoBaixarDic = false;
            this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
              this._projetosService.gerarBotoesAcaoFormularioArquivado(),
            );
            this.trocarModo(false);
            this.loading = false;
            this.isLoadingPessoas = false;
            return;
          }

          const emElaboracaoSemProtocolo =
            projetoModel.status === StatusProjetoEnum.Em_Elaboracao &&
            !projetoModel.protocoloEdocs;

          if (
            emElaboracaoSemProtocolo &&
            this.subProponenteDIC != projetoModel.subResponsavelProponente &&
            this._usuarioService.usuarioPerfil.subNovo ==
            projetoModel.subResponsavelProponente
          ) {
            this.mostrarBotaoPedirRevisaoDic = true;
          } else {
            this.mostrarBotaoPedirRevisaoDic = false;
          }

          if (this.podeResponderComplementacao) {
            this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
              this._projetosService.gerarBotoesAcaoResponderComplementacao(
                this.podeEditar,
              ),
            );
            this.trocarModo(true);
          } else {
            if (this.isProponente) {
              if (
                emElaboracaoSemProtocolo &&
                this.isUsuarioProponenteResponsavel
              ) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnalise(),
                );
              } else if (projetoModel.protocoloEdocs) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao(
                    this.podeSoilictarComplementacao,
                  ),
                );
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponente(),
                );
                this.trocarModo(true);
              }
            } else {
              if (
                emElaboracaoSemProtocolo &&
                this.isUsuarioProponenteResponsavel
              ) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioUsuarioProponenteResponsavel(),
                );
                this.trocarModo(true);
              } else if (projetoModel.protocoloEdocs) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao(
                    this.podeSoilictarComplementacao,
                  ),
                );
                this.trocarModo(false);
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoFormulario(),
                );
                this.trocarModo(true);
              }
            }

            if (projetoModel.status === StatusProjetoEnum.Parecer_SEP) {

              const subeppSubeoEnviados =
                this.pareceresEstrategicoOrcamentarioForamEnviados();

              const subeppSubeoEntranhados =
                this.pareceresEstrategicoOrcamentarioForamEntranhados();

              const parecerSubcapGeoc = this.pareceresProjeto.find((p) =>
                [LotacaoUsuarioEnum.SUBCAP].includes(p.parecerLotacao),
              );

              if (
                (this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEPP ||
                  this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEO) &&
                (!this.parecerProjetoUsuario.guidDocumentoEdocs ||
                  this.parecerProjetoUsuario.guidDocumentoEdocs.length == 0)
              ) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoParecerEstrategicoOrcamentario(),
                );

              } else if (
                this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP && subeppSubeoEntranhados &&
                (!parecerSubcapGeoc ||
                  parecerSubcapGeoc.statusParecer !== StatusParecerEnum.Entranhado_Processo_Edocs
                )
              ) {

                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoParecerGEOC(this.lotacaoUsuario),
                );

              } else if (
                this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP &&
                subeppSubeoEnviados &&
                !subeppSubeoEntranhados
              ) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoesAcaoEntgranharPareceresProcessoEdocs(),
                );

              } else if (
                this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP
              ) {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoeAcaoVoltarContextoParecerSep(),
                );
              } else {
                this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                  this._projetosService.gerarBotoeAcaoVoltar(),
                );
              }

              () => this.trocarModo(true);

            }

          }

          // usa uma flag vinda da API informando se o DIC pode ser Editado..
          this.trocarModo(this.podeEditar);

          this.loading = false;
          this.isLoadingPessoas = false;
        });

        this.mostrarBotaoPendenciasDic = this.podeEditar;

      }),

    );
  }

  private pareceresEstrategicoOrcamentarioForamEnviados(): boolean {
    const pareceresFiltrados = this.pareceresProjeto.filter((p) =>
      [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(
        p.parecerLotacao,
      ),
    );

    const temSubeo = pareceresFiltrados.some(
      (p) => p.parecerLotacao === LotacaoUsuarioEnum.SUBEO,
    );

    const temSubepp = pareceresFiltrados.some(
      (p) => p.parecerLotacao === LotacaoUsuarioEnum.SUBEPP,
    );

    const todosEnviados =
      pareceresFiltrados.length > 0 &&
      pareceresFiltrados.every((p) => p.guidDocumentoEdocs?.length > 0);

    return temSubeo && temSubepp && todosEnviados;
  }

  private pareceresEstrategicoOrcamentarioForamEntranhados(): boolean {
    const pareceresFiltrados = this.pareceresProjeto.filter((p) =>
      [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(
        p.parecerLotacao,
      ),
    );

    const entranhouSubeo = pareceresFiltrados.some(
      (p) => p.parecerLotacao === LotacaoUsuarioEnum.SUBEO,
    );

    const entranhouSubepp = pareceresFiltrados.some(
      (p) => p.parecerLotacao === LotacaoUsuarioEnum.SUBEPP,
    );

    const todosEntranhados =
      pareceresFiltrados.length > 0 &&
      pareceresFiltrados.every(
        (p) => p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs,
      );

    return entranhouSubeo && entranhouSubepp && todosEntranhados;
  }

  public deveComplementarCampo(nomeControle: string): boolean {
    const deveComplementar = this.camposComplementarProjeto.some(
      (campo) => campo.idCampo === nomeControle,
    );
    return (
      (this.statusProjeto == StatusProjetoEnum.Em_Complementacao &&
        deveComplementar) ||
      false
    );
  }

  public mensagemComplementarCampo(nomeControle: string): string {
    const campoEncontrado = this.camposComplementarProjeto.find(
      (campo) => campo.idCampo === nomeControle,
    );
    return campoEncontrado ? campoEncontrado.descricaoComplemento : '';
  }

  public aguardandoParecer(): boolean {
    return this.statusProjeto == StatusProjetoEnum.Parecer_SEP;
  }

  public isProjetoElegivel(): boolean {
    return this.statusProjeto == StatusProjetoEnum.Elegivel;
  }

  ngOnInit(): void {

    const camposPedidoComplementacao: Record<string, string> = {
      sigla: 'Sigla',
      titulo: 'Título',
      idOrganizacao: 'Organização',
      quantia: 'Valor Estimado',
      // moeda: 'Moeda',
      // tipo: 'Tipo Valor',
      rateio: 'Rateio',
      objetivo: 'Objetivo',
      objetivoEspecifico: 'Objetivo Específico',
      situacaoProblema: 'Situação Problema',
      solucoesPropostas: 'Soluções Propostas',
      impactos: 'Impactos',
      arranjosInstitucionais: 'Arranjos Institucionais',
      equipeElaboracao: 'Equipe de Elaboração',
      acoesProjeto: 'Ações do Projeto',
      pecasPlanejamento: 'Peças de Planejamento',
      subResponsavelProponente: 'Responsável Proponente',
      indicadores: 'Indicadores',
      ods: 'ODS',
      geral: 'Geral'
    };

    this.camposParaComplementacao = Object.entries(
      camposPedidoComplementacao,
    ).map(([control, label]) => ({
      name: control,
      label,
      mensagemComplementacao: '',
    }))
      .sort((a, b) => {

        // "geral" sempre primeiro
        if (a.name === 'geral') return -1;
        if (b.name === 'geral') return 1;

        // restante em ordem alfabética pelo label
        return a.label.localeCompare(b.label, 'pt-BR', {
          sensitivity: 'base',
        })

      }) as IEstruturaCamposComplementar[];

    const rotaAtual = this.route.snapshot.routeConfig?.path;
    if (rotaAtual === 'criar') {
      this._projetosService.idProjeto$.next(0);
    }

    const idPelaUrl = this.route.snapshot.paramMap.get('id');
    if (idPelaUrl) {
      this._projetosService.idProjeto$.next(+idPelaUrl);
      this._navegacaoService.navegacaoSimples(
        BreadcrumbContextoEnum.Projetos,
        BreadcrumbAcoesEnum.Editar,
      );
    }

    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
    this.usuario_IdOrganizacoes =
      this._usuarioService.usuarioPerfil.idOrganizacoes;

    this._projetosService.idProjeto$.pipe(take(1)).subscribe((idProjeto) => {
      if (idProjeto > 0) {
        this._subscription.add(
          this._getAllOpcoes$
            .pipe(
              tap(() => {
                this.carregarProjetoEditar(idProjeto);
                this._subscription.add(this._atualizarProjeto$.subscribe());
              }),
            )
            .subscribe(),
        );
      } else {
        this._subscription.add(
          this._getAllOpcoes$.subscribe(() => {
            this.iniciarForm().subscribe(() => {
              this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
                this.isProponente
                  ? this._projetosService.gerarBotoesAcaoFormularioProponente()
                  : this._projetosService.gerarBotoesAcaoFormulario(),
              );

              this.trocarModo(true);

              this.mostrarBotaoBaixarDic = false;
              this.loading = false;
              this.isLoadingPessoas = false;

              this.mostrarBotaoPendenciasDic = true;

            });
          }),
        );
      }
    });

    this._pessoasService.buscarTodosAgentesPublicosGoves().subscribe({
      error: (err) =>
        console.error(
          'Erro ao carregar em cache lista de todos agentes públicos ligados ao Governo :',
          err,
        ),
    });
  }

  private carregarPessoasPorOrganizacao(): Observable<
    IOpcoesDropdownResponsavelProponente[]
  > {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao',
    ) as FormControl<number | null>;

    var valorIdOrganizacao = idOrganizacaoFormControl.value;

    if (valorIdOrganizacao == null)
      valorIdOrganizacao = this.usuario_IdOrganizacoes[0];

    idOrganizacaoFormControl.patchValue(valorIdOrganizacao);

    this.isLoadingPessoas = true;

    return this._pessoasService
      .buscarResponsavelPorIdOrganizacaoAC(valorIdOrganizacao)
      .pipe(
        tap((response) => {
          this.pessoasOpcoes = response;
          this.isLoadingPessoas = false;

          const subResponsavelProponente = this.projetoForm.get(
            'subResponsavelProponente',
          )?.value;
          const pessoa = this.pessoasOpcoes.find(
            (p) => p.agentePublicoSub === subResponsavelProponente,
          );
          this.projetoForm.patchValue({
            nomeResponsavelProponente: pessoa?.nome.toUpperCase() || ' - ',
          });
        }),
        catchError((err) => {
          this.pessoasOpcoes = [];
          this.isLoadingPessoas = false;
          return throwError(() => err);
        }),
      );
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
      (reject) => { },
    );
  }

  public async idMembroNgSelectChangeEvent(
    event: IOpcoesDropdownResponsavelProponente,
  ): Promise<void> {

    const subResponsavelProponente = this.projetoForm.get(
      'subResponsavelProponente',
    ) as FormControl<string | null>;

    const jaExiste =
      this.equipeService.equipeFormArray.value.some(
        (membro) =>
          membro.subPessoa === event.agentePublicoSub &&
          membro.idStatus === TipoStatusEnum.Ativo,
      )

    if (jaExiste) {
      this._toastService.showToast('info', 'Pessoa já incluso na equipe');
    } else {
      this.equipeService.idMembroNgSelectValue$.next(event);
    }

    this.exibirLista = false;

  }

  public idIndicadorNgSelectChangeEvent(event: number): void {
    this.indicadoresService.idIndicadorIndicadoresValue$.next(event);
    setTimeout(() => (this.idIndicadorIndicadores = null));
  }

  public baixarDIC(): void {

    this.loadingDownload = true;
    this.textoSpinner = 'Baixando DIC...';

    this._projetosService.baixarDIC(this._idProjetoEdicao)
      .pipe(
        finalize(() => {
          this.loadingDownload = false;
        })
      )
      .subscribe();

  }

  private iniciarForm(projetoFormModel?: ProjetoFormModel): Observable<any> {

    const valorInicialControleValorEstimado = projetoFormModel?.valor
      ? this._projetosService.construirValorControleValorEstimado(
        projetoFormModel?.valor,
      )
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
        Validators.required,
      ),
      valorEstimado: this._nnfb.control(valorInicialControleValorEstimado, []),
      rateio: this._rateioService.construirRateioFormArray(
        projetoFormModel?.rateio,
      ),
      valor: this._valorService.construirValorFormGroup(
        projetoFormModel?.valor,
      ),
      nomeagente: this._nnfb.control(projetoFormModel?.nomeagente ?? null),
      objetivo: this._nnfb.control(projetoFormModel?.objetivo ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      objetivoEspecifico: this._nnfb.control(
        projetoFormModel?.objetivoEspecifico ?? null,
        [Validators.required, Validators.maxLength(2000)],
      ),
      situacaoProblema: this._nnfb.control(
        projetoFormModel?.situacaoProblema ?? null,
        [Validators.required, Validators.maxLength(2000)],
      ),
      solucoesPropostas: this._nnfb.control(
        projetoFormModel?.solucoesPropostas ?? null,
        [Validators.required, Validators.maxLength(2000)],
      ),
      impactos: this._nnfb.control(projetoFormModel?.impactos ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      arranjosInstitucionais: this._nnfb.control(
        projetoFormModel?.arranjosInstitucionais ?? null,
        [Validators.required, Validators.maxLength(2000)],
      ),
      idResponsavelProponente: this._nnfb.control(
        projetoFormModel?.idResponsavelProponente ?? null,
        Validators.required,
      ),
      equipeElaboracao: this.equipeService.construirEquipeFormArray(
        projetoFormModel?.equipeElaboracao
      ),
      nomeResponsavelProponente: this._nnfb.control(
        projetoFormModel?.nomeResponsavelProponente ?? null,
      ),
      papelResponsavelProponente: this._nnfb.control(
        projetoFormModel?.papelResponsavelProponente ?? null,
      ),
      subResponsavelProponente: this._nnfb.control(
        projetoFormModel?.subResponsavelProponente ?? null,
      ),
      indicadoresProjeto: this.indicadoresService.construirindicadoresFormArray(
        projetoFormModel?.indicadoresProjeto,
      ),
      acoesProjeto: this.acoesService.construirAcoesFormArray(
        projetoFormModel?.acoesProjeto,
      ),
      pecasPlanejamento: this._nnfb.control(
        projetoFormModel?.pecasPlanejamento ?? null,
        [Validators.required, Validators.maxLength(2000)],
      ),
      enviarProjetoGestor: this._nnfb.control(
        projetoFormModel?.enviarProjetoGestor ?? false,
      ),
      justificativaRevisao: this._nnfb.control(
        projetoFormModel?.justificativaRevisao ?? null,
      ),
      justificativaArquivamento: this._nnfb.control(
        projetoFormModel?.justificativaArquivamento ?? null,
      ),
      protocoloEdocs: this._nnfb.control(
        projetoFormModel?.protocoloEdocs ?? '',
      ),
      codigoMotivoArquivamento: this._nnfb.control(
        projetoFormModel?.codigoMotivoArquivamento ?? '',
      ),
      enviarProjetoPedirParecer: this._nnfb.control(
        projetoFormModel?.enviarProjetoPedirParecer ?? false,
      ),

      parecerProjetoUsuario: this._nnfb.group({

        id: [projetoFormModel?.parecerProjetoUsuario?.id ?? null],
        idProjeto: [projetoFormModel?.parecerProjetoUsuario?.idProjeto ?? null],
        statusParecer: [projetoFormModel?.parecerProjetoUsuario?.statusParecer ?? null,],
        textoParecer: [projetoFormModel?.parecerProjetoUsuario?.textoParecer ?? '',],
        dataEnvioParecer: [projetoFormModel?.parecerProjetoUsuario?.dataEnvio ?? null,],
        guidDocumentoEdocs: [projetoFormModel?.parecerProjetoUsuario?.guidDocumentoEdocs ?? '',],
        guidUnidadeOrganizacao: [projetoFormModel?.parecerProjetoUsuario?.guidUnidadeOrganizacao ?? '',],
        usuarioFezEnvioParecer: [projetoFormModel?.parecerProjetoUsuario?.usuarioFezEnvioParecer ?? '',],
        elegivel: [projetoFormModel?.parecerProjetoUsuario.elegivel ?? null],
        nomeArquivo: [projetoFormModel?.parecerProjetoUsuario?.nomeArquivo ?? '',],
        nomeOriginalArquivo: [projetoFormModel?.parecerProjetoUsuario?.nomeOriginalArquivo ?? '',],

        anexos: this._nnfb.group({
          nomeArquivo: [
            projetoFormModel?.parecerProjetoUsuario?.anexos?.nomeArquivo ?? ''
          ],
          tamanhoBytes: [
            projetoFormModel?.parecerProjetoUsuario?.anexos?.tamanhoBytes ?? null
          ],
          tipoMime: [
            projetoFormModel?.parecerProjetoUsuario?.anexos?.tipoMime ?? ''
          ],
          tamanhoFormatado: [
            projetoFormModel?.parecerProjetoUsuario?.anexos?.tamanhoFormatado ?? ''
          ],
        }),

      }),

      acoesPlanejamentoProjeto: this._nnfb.control(
        projetoFormModel?.acoesPlanejamentoProjeto ?? false,
      ),

      naoPrevistoNoPpa: this._nnfb.control(
        projetoFormModel?.naoPrevistoNoPpa ?? false,
      ),

      pareceresProjeto: this._nnfb.array([]),

      indicadoresAvulsosProjeto:
        this.indicadoresService.construirindicadoresAvulsosFormArray(projetoFormModel?.indicadoresAvulsosProjeto),

      odsProjeto: this._nnfb.array(
        projetoFormModel?.odsProjeto?.map((ods: any) =>
          this._nnfb.group({
            idOdsProjeto: this._nnfb.control(ods.idOdsProjeto ?? null),
            odsId: this._nnfb.control(ods.odsId ?? null),
            odsOrdem: this._nnfb.control(ods.odsOrdem ?? null),
            odsNome: this._nnfb.control(ods.odsNome ?? null),
            odsDescricao: this._nnfb.control(ods.odsDescricao ?? null),
            odsCor: this._nnfb.control(ods.odsCor ?? null),
          })
        ) ?? []
      )

    });

    const mapSubObs: { [index: string]: Observable<string> } = {};
    projetoFormModel?.pareceresProjeto
      ?.filter((p) => p.usuarioFezEnvioParecer)
      .forEach((parecer) => {
        mapSubObs[parecer.usuarioFezEnvioParecer] = this._pessoasService
          .buscarMeuPerfil(parecer.usuarioFezEnvioParecer)
          .pipe(map((pessoa) => pessoa.nome));
      });

    return concat(
      forkJoin(mapSubObs).pipe(tap((retorno) => (this.mapSubUser = retorno))),
      this.carregarPessoasPorOrganizacao(),
    ).pipe(
      tap(() => {
        this.projetoFormValueChanges();

        this.valorFormValueChanges();

        if (this.isProponente && !projetoFormModel)
          this.usuarioProponenteValoresIniciaisProjetoForm();
      }),
    );
  }

  private usuarioProponenteValoresIniciaisProjetoForm(): void {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao',
    ) as FormControl<number | null>;

    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);

    const indexGestor = this.pessoasOpcoes.findIndex(
      (pessoa) => pessoa.gestorOrganizacao === true,
    );

    if (indexGestor > 0) {
      this.projetoForm.patchValue({
        idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
        nomeResponsavelProponente:
          this.pessoasOpcoes[indexGestor].nome.toLowerCase,
        papelResponsavelProponente:
          this.pessoasOpcoes[indexGestor].papelPrioritario,
        subResponsavelProponente:
          this.pessoasOpcoes[indexGestor].agentePublicoSub,
      });
    } else {
      if (this.pessoasOpcoes.length > 0) {
        this.projetoForm.patchValue({
          idResponsavelProponente: null,
          nomeResponsavelProponente: '',
          papelResponsavelProponente: '',
          subResponsavelProponente: '',
        });
      }
    }
  }

  private projetoFormValueChanges(): void {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao',
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente',
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
            (membro) => membro.idPessoa === idResponsavelProponenteValue,
          );
        if (
          this.equipeService.equipeFormArray.length > 0 &&
          idResponsavelProponenteFormControl.dirty &&
          isEquipePossuiIdResponsavelProponente
        ) {
          this._toastService.showToast(
            'info',
            'Responsável proponente já incluso na equipe',
            ['Limpando membros da equipe.'],
          );
          this.equipeService.equipeFormArray.clear();
        }
      },
    );
  }

  private valorFormValueChanges(): void {
    const valorFormGroup = this.projetoForm.get(
      'valor',
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
        moedaFormControl.value,
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
    const parecerFormGroup = this.projetoForm.get(
      'parecerProjetoUsuario',
    ) as FormGroup | null;

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
        guidUnidadeOrganizacao: '',
      });
    }

  }

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {
    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente',
    ) as FormControl<number | null>;

    const subResponsavelProponente = this.projetoForm.get(
      'subResponsavelProponente',
    ) as FormControl<string | null>;

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
              (pessoa) => pessoa.gestorOrganizacao === true,
            );

            if (indexGestor > 0) {
              this.projetoForm.patchValue({
                idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
                nomeResponsavelProponente:
                  this.pessoasOpcoes[indexGestor].nome.toUpperCase(),
                papelResponsavelProponente:
                  this.pessoasOpcoes[indexGestor].papelPrioritario,
                subResponsavelProponente:
                  this.pessoasOpcoes[indexGestor].agentePublicoSub,
              });
            } else {
              if (this.pessoasOpcoes.length > 0) {
                this.projetoForm.patchValue({
                  idResponsavelProponente: null,
                  nomeResponsavelProponente: '',
                  papelResponsavelProponente: '',
                  subResponsavelProponente: '',
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
          BreadcrumbContextoEnum.Projetos,
        );
        break;

      // case BreadcrumbAcoesEnum.Salvar:
      //   this.submitProjetoForm(this.projetoForm, true, false);
      //   break;

      case BreadcrumbAcoesEnum.Salvar:
        this.salvarRascunho();
        break;

      case BreadcrumbAcoesEnum.Enviar:
        this.salvarEEnviar();
        break;

      // this.projetoForm.patchValue({
      //   enviarProjetoGestor: true,
      // });
      // if (!this.validarFormulario(this.projetoForm, true)) break;
      // this.validacaoSomaValoresAcoesEnviar(this.projetoForm);
      // break;

      case BreadcrumbAcoesEnum.AssinarAutuar:
        this.projetoForm.patchValue({
          autuarConfirmacaoProjetoModal: true,
          enviarProjetoGestor: false,
        });

        const controlJustificativaRevisao = this.projetoForm.get(
          'justificativaRevisao',
        );
        controlJustificativaRevisao?.clearValidators();
        controlJustificativaRevisao?.updateValueAndValidity();

        const controlJustificativaArquivamento = this.projetoForm.get(
          'justificativaArquivamento',
        );
        controlJustificativaArquivamento?.clearValidators();
        controlJustificativaArquivamento?.updateValueAndValidity();

        const codigoMotivoArquivamento = this.projetoForm.get(
          'codigoMotivoArquivamento',
        );
        codigoMotivoArquivamento?.clearValidators();
        codigoMotivoArquivamento?.updateValueAndValidity();

        if (!this.validarFormulario(this.projetoForm, true)) break;

        if (this.compararValorEstimadoValorAcoes()) {
          if (this.statusProjeto == StatusProjetoEnum.Em_Complementacao)
            this.abrirConfirmarIntegracapEdocsModalReentranharDic(
              this.projetoForm,
            );
          else this.abrirConfirmarIntegracapEdocsModal(this.projetoForm);
        }
        break;

      case BreadcrumbAcoesEnum.Voltar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Projetos,
        );
        break;

      case BreadcrumbAcoesEnum.Arquivar:
        this.abrirArquivarModal(this.projetoForm);
        break;

      case BreadcrumbAcoesEnum.Complementar:
        this.abrirComplementacaoModal();
        break;

      case BreadcrumbAcoesEnum.EnviarPedindoParecerEstrategicoOrcamentario:
        this.projetoForm.patchValue({
          enviarProjetoPedirParecer: true,
        });
        if (!this.validarFormulario(this.projetoForm, true)) break;
        this.validacaoSomaValoresAcoesEnviarParecer(this.projetoForm);
        break;

      case BreadcrumbAcoesEnum.EnviarEfetivacaoParecerEstrategicoOrgamentario:
        this.abrirEfetivarParecerModal();
        break;

      case BreadcrumbAcoesEnum.EntranharPareceresProcessoEdocs:
        this.abrirEntranhamentoPareceresModal();
        break;

      case BreadcrumbAcoesEnum.CapturarparecerGEOC:
        this.abrirEfetivarParecerModal();
        break;

      case BreadcrumbAcoesEnum.PendenciasDIC:
        this.abrirModalPendencias(this.obterPendenciasProjeto());
        break;

    }
  }

  private validacaoSomaValoresAcoesEnviar(
    form: FormGroup
  ): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.abrirConfirmarEnvioMembroModal(form);
    }
  }

  private validacaoSomaValoresAcoesEnviarParecer(
    form: FormGroup,
  ): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.abrirConfirmarEnvioParecerModal(form);
    }
  }

  private compararValorEstimadoValorAcoes(): boolean {

    const valorEstimadoProjeto = this.projetoForm.get(
      'valorEstimado',
    ) as FormControl<number>;

    const valorFormGroup = this.projetoForm.get(
      'valor',
    ) as FormGroup<ValorFormType>;

    const quantiaFormControl = valorFormGroup.get('quantia') as FormControl<
      number | null
    >;

    const acoesProjetoValues = this.projetoForm.get('acoesProjeto')?.value;

    if (!acoesProjetoValues) return false;

    const totalValorAcoesInformadas = acoesProjetoValues
      .filter((acao: IAcao) => acao.idStatus === TipoStatusEnum.Ativo)
      .reduce((sum: number, acao: { valorEstimadoAcaoPrincipal: any }) => {
        const valor = Number(acao.valorEstimadoAcaoPrincipal) || 0;
        return sum + valor;
      }, 0);

    const valorSomaAcoes = Number(totalValorAcoesInformadas) || 0;

    const valorEstimadoTotal =
      Number(quantiaFormControl.value) || Number(valorEstimadoProjeto.value);

    if (Math.abs(valorSomaAcoes - valorEstimadoTotal) < 0.001) {
      return true;
    }

    // this._toastService.showToast(
    //   'error',
    //   'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.',
    //   [
    //     'A soma dos valores estimado das ações deve ser igual ao valor estimado do projeto.',
    //   ],
    // );

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
      'parecerProjetoUsuario.textoParecer',
    ) as FormControl<string | null>;

    const idDocumentoEdocsFormControl = this.projetoForm.get(
      'parecerProjetoUsuario.guidDocumentoEdocs',
    ) as FormControl<string | null>;

    if (
      this.statusProjeto === StatusProjetoEnum.Parecer_SEP ||
      this.statusProjeto === StatusProjetoEnum.Elegivel
    ) {
      setTimeout(() => {
        const idDocumentoEdocsParecer =
          idDocumentoEdocsFormControl?.value ?? '';
        if (idDocumentoEdocsParecer.length > 0)
          textoParecerFormControl.disable({ emitEvent: false });
        else textoParecerFormControl.enable({ emitEvent: false });
      });
    }
  }

  public isSubcapGeoc(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP;
  }

  public isGeocEditavel(): boolean {
    const subeoSubeppEntranhados =
      this.pareceresProjeto.length > 0 &&
      this.pareceresProjeto
        .filter((p) =>
          [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(
            p.parecerLotacao,
          ),
        )
        .every(
          (p) =>
            p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs,
        );
    return (
      this.statusProjeto === StatusProjetoEnum.Parecer_SEP &&
      this.isSubeoSubeppEntranhados()
    );
  }

  public isSubeoSubeppEntranhados(): boolean {
    const subeoSubeppEntranhados =
      this.pareceresProjeto.length > 0 &&
      this.pareceresProjeto
        .filter((p) =>
          [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(
            p.parecerLotacao,
          ),
        )
        .every(
          (p) =>
            p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs,
        );
    return subeoSubeppEntranhados;
  }

  private validarFormulario(form: FormGroup, isEnvioDic: boolean): boolean {

    if (this.obterPendenciasProjeto()?.length > 0) {
      this.abrirModalPendencias(this.obterPendenciasProjeto())
      return false;
    }

    return true;

  }

  getLotacao(nLotacao: number) {
    switch (nLotacao) {
      case LotacaoUsuarioEnum.SUBCAP:
        return 'Captação';
      case LotacaoUsuarioEnum.SUBEO:
        return 'Orçamentário';
      case LotacaoUsuarioEnum.SUBEPP:
        return 'Estratégico';
    }
    return undefined;
  }

  get isParecerGeoc(): boolean {
    return (
      (this.parecerProjetoUsuario.parecerLotacao ?? this.lotacaoUsuario) ==
      LotacaoUsuarioEnum.SUBCAP
    );
  }

  get demaisPareceres() {
    return [
      LotacaoUsuarioEnum.SUBEPP,
      LotacaoUsuarioEnum.SUBEO,
      ...(this.isSubeoSubeppEntranhados() ? [LotacaoUsuarioEnum.SUBCAP] : []),
    ]
      .map((n) => {
        const parecer = this.pareceresProjeto.filter(
          (p) => p.parecerLotacao === n,
        )[0];

        return (
          parecer ??
          ({
            parecerLotacao: n,
          } as IParecer)
        );
      })
      .filter(
        (parecer) =>
          !this.aguardandoParecer() ||
          this.isProjetoElegivel() ||
          parecer.parecerLotacao !== this.lotacaoUsuario,
      );
  }

  private reenviarEmailPedidoParecer(): Observable<void> {
    return this._projetosService
      .reEnviarEmailPedidoParecerProjeto(this._idProjetoEdicao)
      .pipe(
        tap(() => {
          this._toastService.showToast(
            'success',
            'E-mail de pedido de parecer reenviado com sucesso.',
          );
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),
      );
  }

  private submitProjetoForm(form: FormGroup, isRascunho: boolean, isEnvioDic: boolean): void {

    this.loadingSubmit = true;
    this.textoSpinner = 'Salvando projeto...';

    if (
      this.statusProjeto === StatusProjetoEnum.Parecer_SEP ||
      this.statusProjeto === StatusProjetoEnum.Elegivel
    ) {

      const parecerControl = this.projetoForm.get(
        'parecerProjetoUsuario',
      ) as FormGroup;

      if (parecerControl.invalid) {
        parecerControl.markAllAsTouched();
        return;
      }

      const indicadoresProjetoPayload = this.projetoForm.getRawValue()
        .indicadoresProjeto
        .filter((indicador: IIndicadores) =>
          (indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno ?? 0) !== 0
        )
        .map((indicador: IIndicadores) => ({
          idIndicador: indicador.idIndicador,
          tipoIndicador: indicador.tipoIndicador ?? null,
          descricaoIndicador: indicador.descricaoIndicador ?? null,
          descricaoMeta: indicador.descricaoMeta ?? null,
          idStatus: indicador.idStatus ?? 1,
          idIndicadorExterno: indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno,
          metasIndicadorProjeto: indicador.metasIndicadorProjeto?.map(meta => ({
            id: meta.id,
            anoMeta: meta.anoMeta,
            valorMeta: meta.valorMeta
          })) ?? []
        }));

      const indicadoresAvulsosPayload = this.projetoForm.getRawValue()
        .indicadoresAvulsosProjeto
        .filter((indicador: IIndicadorAvulso) => indicador?.nomeIndicador?.trim())
        .map((indicador: IIndicadorAvulso) => ({
          id: indicador.id ?? null,
          idIndicadorAvulso: indicador.idIndicador ?? null,
          indicadorAvulso: {
            id: indicador.idIndicador ?? null,
            nomeIndicador: indicador.nomeIndicador,
            unidadeMedida: indicador.unidadeMedida,
            fonteIndicador: indicador.fonteIndicador,
            medidoPor: indicador.medidoPor,
            baseDeReferencia: indicador.basedeReferencia
          },
          metasIndicadorProjeto: indicador.metasIndicadorProjeto
        }));

      const indicadoresProjetoControl = this.projetoForm.get('indicadoresProjeto');
      const estavaDisabled = indicadoresProjetoControl?.disabled;

      indicadoresProjetoControl?.disable({ emitEvent: false });

      if (!estavaDisabled) {
        indicadoresProjetoControl?.enable({ emitEvent: false });
      }

      const odsProjetoPayload = this.projetoForm.getRawValue()
        .odsProjeto
        ?.map((ods: any) => ({
          idOdsProjeto: ods.idOdsProjeto ?? null,
          odsId: ods.odsId,
          odsOrdem: ods.odsOrdem,
          odsNome: ods.odsNome,
          odsDescricao: ods.odsDescricao
        })) ?? [];

      const payload =
        new ProjetoFormModel(form.getRawValue() as IProjetoForm);

      payload.indicadoresProjeto = indicadoresProjetoPayload;
      payload.indicadoresAvulsosProjeto = indicadoresAvulsosPayload;
      payload.odsProjeto = odsProjetoPayload;

      payload.parecerProjetoUsuario = this.projetoForm
        .get('parecerProjetoUsuario')
        ?.getRawValue();

      const formData = new FormData();

      formData.append(
        'projeto',
        new Blob([JSON.stringify(payload)], {
          type: 'application/json'
        })
      );

      if (this.arquivoParecerSelecionado) {
        formData.append('arquivoParecerAnexo', this.arquivoParecerSelecionado);
      }

      // console.log('PAYLOAD SUBMIT (PARECER):', payload);

      this.atualizarProjeto(payload, isRascunho, formData).pipe(
        finalize(() => {
          this.loadingSubmit = false;
          this.textoSpinner = 'Salvando alterações...';
        })
      ).subscribe();

    } else {

      const indicadoresProjetoPayload = this.projetoForm.getRawValue()
        .indicadoresProjeto
        .filter((indicador: IIndicadores) =>
          (indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno ?? 0) !== 0
        )
        .map((indicador: IIndicadores) => ({
          idIndicador: indicador.idIndicador,
          tipoIndicador: indicador.tipoIndicador ?? null,
          descricaoIndicador: indicador.descricaoIndicador ?? null,
          descricaoMeta: indicador.descricaoMeta ?? null,
          idStatus: indicador.idStatus ?? 1,
          idIndicadorExterno: indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno,
          metasIndicadorProjeto: indicador.metasIndicadorProjeto?.map(meta => ({
            id: meta.id,
            anoMeta: meta.anoMeta,
            valorMeta: meta.valorMeta
          })) ?? []
        }));

      const indicadoresAvulsosPayload = this.projetoForm.getRawValue()
        .indicadoresAvulsosProjeto
        .filter((indicador: IIndicadorAvulso) => indicador?.nomeIndicador?.trim())
        .map((indicador: IIndicadorAvulso) => ({
          id: indicador.id ?? null,
          idIndicadorAvulso: indicador.idIndicador ?? null,
          indicadorAvulso: {
            id: indicador.idIndicador ?? null,
            nomeIndicador: indicador.nomeIndicador,
            unidadeMedida: indicador.unidadeMedida,
            fonteIndicador: indicador.fonteIndicador,
            formulaCalculo: indicador.formulaCalculo,
            medidoPor: indicador.medidoPor,
            baseDeReferencia: indicador.basedeReferencia
          },
          metasIndicadorProjeto: indicador.metasIndicadorProjeto
        }));

      // const temIndicador =
      //   indicadoresProjetoPayload.length > 0 || indicadoresAvulsosPayload.length > 0;

      // if (!temIndicador) {
      //   this._toastService.showToast('warning', 'O formulário contém erros.', [
      //     'Informe pelo menos um indicador.'
      //   ]);
      //   return;
      // }

      const indicadoresProjetoControl = this.projetoForm.get('indicadoresProjeto');
      const estavaDisabled = indicadoresProjetoControl?.disabled;

      indicadoresProjetoControl?.disable({ emitEvent: false });

      // const formValido = this.validarFormulario(form, isEnvioDic);

      if (!estavaDisabled) {
        indicadoresProjetoControl?.enable({ emitEvent: false });
      }

      // if (!formValido) {
      //   return;
      // }

      form.get('valor.tipo')?.enable();
      form.get('valor.moeda')?.enable();

      const odsProjetoPayload = this.projetoForm.getRawValue()
        .odsProjeto
        ?.map((ods: any) => ({
          idOdsProjeto: ods.idOdsProjeto ?? null,
          odsId: ods.odsId,
          odsOrdem: ods.odsOrdem,
          odsNome: ods.odsNome,
          odsDescricao: ods.odsDescricao
        })) ?? [];

      const payload =
        new ProjetoFormModel(form.getRawValue() as IProjetoForm);

      if (this.isProponente) {
        payload.idOrganizacao =
          form.get('idOrganizacao')?.value;
      }

      payload.indicadoresProjeto = indicadoresProjetoPayload;
      payload.indicadoresAvulsosProjeto = indicadoresAvulsosPayload;
      payload.odsProjeto = odsProjetoPayload;

      // if (!this.validarIndicadores(payload.indicadoresProjeto, payload.indicadoresAvulsosProjeto)) {
      //   return;
      // }

      const formData = new FormData();

      formData.append(
        'projeto',
        new Blob([JSON.stringify(payload)], {
          type: 'application/json'
        })
      );

      // console.log('PAYLOAD SUBMIT (NOVO):', payload);

      const requisicao = this._idProjetoEdicao
        ? this.atualizarProjeto(payload, isRascunho, formData)
        : this.cadastrarProjeto(payload, isRascunho);

      this.loadingSubmit = true;
      this.textoSpinner = this._idProjetoEdicao
        ? 'Salvando alterações...'
        : 'Cadastrando DIC...';

      requisicao
        .pipe(
          finalize(() => {
            this.loadingSubmit = false;
            this.textoSpinner = 'Carregando...';
          })
        )
        .subscribe();

    }

  }

  private validarIndicadores(indicadoresBiDIC: Array<IIndicadores>, indicadoresAvulsos: Array<IIndicadorAvulso>): boolean {

    const indicadoresArray = indicadoresBiDIC;
    const indicadoresAvulsosArray = indicadoresAvulsos;

    const temIndicadores = indicadoresArray?.length > 0;
    const temIndicadoresAvulsos = indicadoresAvulsosArray?.length > 0;

    if (!temIndicadores && !temIndicadoresAvulsos) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'É obrigatório informar ao menos um indicador.',
      ]);
      return false;
    }

    const algumIndicadorSemMeta =
      indicadoresArray.some((i: any) =>
        i.metasIndicadorProjeto?.some((m: any) => !m.valorMeta)
      ) ||
      indicadoresAvulsosArray.some((i: any) =>
        i.metasIndicadorProjeto?.some((m: any) => !m.valorMeta)
      );

    if (algumIndicadorSemMeta) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'É obrigatório preencher todas as metas dos indicadores.',
      ]);
      return false;
    }

    // const algumIndicadorComMetaInvalida =
    //   indicadoresArray.some((i: any) =>
    //     i.metasIndicadorProjeto?.some((m: any) => Number(m.valorMeta) <= 0)
    //   ) ||
    //   indicadoresAvulsosArray.some((i: any) =>
    //     i.metasIndicadorProjeto?.some((m: any) => Number(m.valorMeta) <= 0)
    //   );

    // if (algumIndicadorComMetaInvalida) {
    //   this._toastService.showToast('warning', 'Erro ao validar indicadores', [
    //     'Todas as metas dos indicadores devem ser preenchidas com valores maiores que zero.',
    //   ]);
    //   return false;
    // }

    return true;

  }

  onSelecionarOrganizacao(organizacao: any) {
    this.projetoForm.patchValue({
      idResponsavelProponente: null,
      nomeResponsavelProponente: '',
      papelResponsavelProponente: '',
      subResponsavelProponente: '',
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
        subResponsavelProponente: pessoa.agentePublicoSub,
      });
      this.lotacaoGestorProjeto = pessoa.papelPrioritario;
    } else {
      this.projetoForm.patchValue({
        idResponsavelProponente: null,
        nomeResponsavelProponente: '',
        papelResponsavelProponente: '',
        subResponsavelProponente: '',
      });
      this.lotacaoGestorProjeto = '';
    }

  }

  private cadastrarProjeto(
    payload: ProjetoFormModel,
    isRascunho: boolean,
  ): Observable<IProjeto> {
    if (payload.idResponsavelProponente === 0) {
      const dados = this.projetoForm.value;
      return this._pessoasService.getBySub(dados.subResponsavelProponente).pipe(
        switchMap((idPessoa: number) => {
          payload.idResponsavelProponente = idPessoa;
          return this._projetosService.post(payload, isRascunho);
        }),
        tap(() => {
          this._toastService.showToast(
            'success',
            'Projeto cadastrado com sucesso.',
          );
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),
        // finalize(() =>
        //   this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar),
        // ),
      );
    }

    return this._projetosService.post(payload, isRascunho).pipe(
      tap((response: IProjeto) => {
        this._toastService.showToast(
          'success',
          'Projeto cadastrado com sucesso.',
        );
      }),
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar)),
    );
  }

  private atualizarProjeto(
    payload: ProjetoFormModel,
    isRascunho: boolean,
    formData: FormData
  ): Observable<IProjeto> {

    if (payload.idResponsavelProponente === 0) {

      const dados = this.projetoForm.value;
      return this._pessoasService.getBySub(dados.subResponsavelProponente)
        .pipe(
          switchMap((idPessoa: number) => {
            payload.idResponsavelProponente = idPessoa;
            return this._projetosService.put(
              this._idProjetoEdicao,
              payload,
              isRascunho,
              formData
            );
          }),
          tap(() => {
            this._toastService.showToast(
              'success',
              'Projeto alterado com sucesso.',
            );
            this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
          }),
          // finalize(() =>
          //   this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar),
          // ),
        );

    }

    return this._projetosService
      .put(this._idProjetoEdicao, payload, isRascunho, formData)
      .pipe(
        tap((response: IProjeto) => {
          this._toastService.showToast(
            'success',
            'Projeto alterado com sucesso.',
          );
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),
        // finalize(() =>
        //   this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar),
        // ),
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
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar),
        ),
      )
      .subscribe();
  }

  public buscarAgentesPorTermo(): IOpcoesDropdownResponsavelProponente[] {
    this.isLoadingPessoasFiltroTermo = true;

    const termo = this.projetoForm.get('nomeagente')?.value ?? '';

    if (termo.length < 3) {
      this._toastService.showToast(
        'info',
        'Informe pelo menos um nome com no mínimo 3 caracteres.',
      );
      this.pessoasOpcoesGoves = [];
      this.isLoadingPessoasFiltroTermo = false;
      return this.pessoasOpcoesGoves;
    }

    this._pessoasService.buscarAgentesPorTermo(termo).subscribe({
      next: (lista) => {
        this.pessoasOpcoesGoves = lista;

        this.pessoasOpcoesGoves = this.pessoasOpcoesGoves.filter(
          (pessoa) =>
            !this.equipeProjeto.some(
              (membro) =>
                membro.idStatus === TipoStatusEnum.Inativo &&
                membro.subPessoa === pessoa.agentePublicoSub,
            ),
        );

        if (this.pessoasOpcoesGoves.length === 0) {
          this._toastService.showToast('info', 'Nenhum agente encontrado.', [
            'Verifique se já faz parte da equipe.',
          ]);
        }

        this.isLoadingPessoasFiltroTermo = false;
        this.exibirLista = true;

        this.projetoForm.get('nomeagente')?.reset();
      },
      error: () => {
        this.pessoasOpcoesGoves = [];
        this.isLoadingPessoasFiltroTermo = false;
      },
    });

    return this.pessoasOpcoesGoves;
  }

  public abrirConfirmarEnvioMembroModal(form: FormGroup) {
    this.nomeProponenteResponsavel =
      this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() ||
      '-';

    const modalRef = this._ngbModalService.open(
      this.enviarProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.submitProjetoForm(form, false, true);
      }
    });
  }

  public abrirConfirmarEnvioParecerModal(form: FormGroup) {
    this.nomeProponenteResponsavel =
      this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() ||
      '-';

    const modalRef = this._ngbModalService.open(
      this.enviarParecerProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {

        if (this.statusProjeto == StatusProjetoEnum.Parecer_SEP) {

          this.loadingSubmit = true;
          this.textoSpinner = 'Reenviando pedido parecer...'

          this.reenviarEmailPedidoParecer()
            .pipe(finalize(() => {
              this.loadingSubmit = false;
              this.textoSpinner = 'Carregando...';
            }))
            .subscribe({
              error: (error) => {
                console.error('[Reenvio Parecer] Erro:', error);
                this._toastService.showToast(
                  'error',
                  'Erro ao reenviar e-mail de pedido de parecer.',
                );
              },
            });

          return;

        }

        this.submitProjetoForm(form, false, true);

      }
    });
  }

  public abrirRevisarModal(form: FormGroup) {
    const controlJustificativaRevisao = form.get('justificativaRevisao');
    controlJustificativaRevisao?.setValidators([
      Validators.required,
      Validators.maxLength(200),
    ]);
    controlJustificativaRevisao?.updateValueAndValidity();

    const modalRef = this._ngbModalService.open(
      this.confirmarRevisarProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.enviarProjetoRevisaoForm(this.projetoForm);
      }
    });
  }

  public abrirArquivarModal(form: FormGroup) {
    const codigoMotivoArquivamento = this.projetoForm.get(
      'codigoMotivoArquivamento',
    );
    codigoMotivoArquivamento?.setValidators([
      Validators.required,
      Validators.maxLength(200),
    ]);
    codigoMotivoArquivamento?.updateValueAndValidity();

    const modalRef = this._ngbModalService.open(
      this.confirmarArquivarProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.enviarProjetoArquivamentoForm();
      }
    });

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

  private abrirConfirmarIntegracapEdocsModalReentranharDic(form: FormGroup) {
    this.nomeProponenteResponsavel =
      this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() ||
      '-';

    const modalRef = this._ngbModalService.open(
      this.confirmarIntegracaoReentranharProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
      },
    );
  }

  private abrirConfirmarIntegracapEdocsModal(form: FormGroup) {
    this.nomeProponenteResponsavel =
      this.projetoForm.get('nomeResponsavelProponente')?.value.toUpperCase() ||
      '-';

    const modalRef = this._ngbModalService.open(
      this.confirmarIntegracaoProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
      },
    );
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

  public confirmarAssinarCapturarParecer(elegivel?: boolean) {
    this.autuacaoAcionada = true;
    this.assinarAutuar = false;
    this.finalizadoProcessamentoIntegracao = false;
    this.projetoForm.get('parecerProjetoUsuario')?.patchValue({
      ...this.projetoForm.get('parecerProjetoUsuario')?.getRawValue(),
      elegivel,
    });
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

      const indicadoresProjetoPayload = this.projetoForm.getRawValue()
        .indicadoresProjeto
        .filter((indicador: IIndicadores) =>
          (indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno ?? 0) !== 0
        )
        .map((indicador: IIndicadores) => ({
          idIndicador: indicador.idIndicador,
          tipoIndicador: indicador.tipoIndicador ?? null,
          descricaoIndicador: indicador.descricaoIndicador ?? null,
          descricaoMeta: indicador.descricaoMeta ?? null,
          idStatus: indicador.idStatus ?? 1,
          idIndicadorExterno: indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno,
          metasIndicadorProjeto: indicador.metasIndicadorProjeto?.map(meta => ({
            id: meta.id,
            anoMeta: meta.anoMeta,
            valorMeta: meta.valorMeta
          })) ?? []
        }));

      const indicadoresAvulsosPayload = this.projetoForm.getRawValue()
        .indicadoresAvulsosProjeto
        .filter((indicador: IIndicadorAvulso) => indicador?.nomeIndicador?.trim())
        .map((indicador: IIndicadorAvulso) => ({
          id: indicador.id ?? null,
          idIndicadorAvulso: indicador.idIndicador ?? null,
          indicadorAvulso: {
            id: indicador.idIndicador ?? null,
            nomeIndicador: indicador.nomeIndicador,
            unidadeMedida: indicador.unidadeMedida,
            fonteIndicador: indicador.fonteIndicador,
            medidoPor: indicador.medidoPor,
            baseDeReferencia: indicador.basedeReferencia
          },
          metasIndicadorProjeto: indicador.metasIndicadorProjeto
        }));

      // const temIndicador =
      //   indicadoresProjetoPayload.length > 0 || indicadoresAvulsosPayload.length > 0;

      // if (!temIndicador) {
      //   this._toastService.showToast('warning', 'O formulário contém erros.', [
      //     'Informe pelo menos um indicador.'
      //   ]);
      //   return;
      // }

      const indicadoresProjetoControl = this.projetoForm.get('indicadoresProjeto');
      const estavaDisabled = indicadoresProjetoControl?.disabled;

      indicadoresProjetoControl?.disable({ emitEvent: false });

      const formValido = this.validarFormulario(form, true);

      if (!estavaDisabled) {
        indicadoresProjetoControl?.enable({ emitEvent: false });
      }

      if (!formValido) {
        return;
      }

      form.get('valor.tipo')?.enable();
      form.get('valor.moeda')?.enable();

      const odsProjetoPayload = this.projetoForm.getRawValue()
        .odsProjeto
        ?.map((ods: any) => ({
          idOdsProjeto: ods.idOdsProjeto ?? null,
          odsId: ods.odsId,
          odsOrdem: ods.odsOrdem,
          odsNome: ods.odsNome,
          odsDescricao: ods.odsDescricao
        })) ?? [];

      const payload =
        new ProjetoFormModel(form.getRawValue() as IProjetoForm);

      if (this.isProponente) {
        payload.idOrganizacao =
          form.get('idOrganizacao')?.value;
      }

      payload.indicadoresProjeto = indicadoresProjetoPayload;
      payload.indicadoresAvulsosProjeto = indicadoresAvulsosPayload;
      payload.odsProjeto = odsProjetoPayload;

      if (!this.validarIndicadores(payload.indicadoresProjeto, payload.indicadoresAvulsosProjeto)) {
        return;
      }

      // const payload = new ProjetoFormModel(form.value as IProjetoForm);
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

      const indicadoresProjetoPayload = this.projetoForm.getRawValue()
        .indicadoresProjeto
        .filter((indicador: IIndicadores) =>
          (indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno ?? 0) !== 0
        )
        .map((indicador: IIndicadores) => ({
          idIndicador: indicador.idIndicador,
          tipoIndicador: indicador.tipoIndicador ?? null,
          descricaoIndicador: indicador.descricaoIndicador ?? null,
          descricaoMeta: indicador.descricaoMeta ?? null,
          idStatus: indicador.idStatus ?? 1,
          idIndicadorExterno: indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno,
          metasIndicadorProjeto: indicador.metasIndicadorProjeto?.map(meta => ({
            id: meta.id,
            anoMeta: meta.anoMeta,
            valorMeta: meta.valorMeta
          })) ?? []
        }));

      const indicadoresAvulsosPayload = this.projetoForm.getRawValue()
        .indicadoresAvulsosProjeto
        .filter((indicador: IIndicadorAvulso) => indicador?.nomeIndicador?.trim())
        .map((indicador: IIndicadorAvulso) => ({
          id: indicador.id ?? null,
          idIndicadorAvulso: indicador.idIndicador ?? null,
          indicadorAvulso: {
            id: indicador.idIndicador ?? null,
            nomeIndicador: indicador.nomeIndicador,
            unidadeMedida: indicador.unidadeMedida,
            fonteIndicador: indicador.fonteIndicador,
            medidoPor: indicador.medidoPor,
            baseDeReferencia: indicador.basedeReferencia
          },
          metasIndicadorProjeto: indicador.metasIndicadorProjeto
        }));

      const temIndicador =
        indicadoresProjetoPayload.length > 0 || indicadoresAvulsosPayload.length > 0;

      if (!temIndicador) {
        this._toastService.showToast('warning', 'O formulário contém erros.', [
          'Informe pelo menos um indicador.'
        ]);
        return;
      }

      const indicadoresProjetoControl = this.projetoForm.get('indicadoresProjeto');
      const estavaDisabled = indicadoresProjetoControl?.disabled;

      indicadoresProjetoControl?.disable({ emitEvent: false });

      const formValido = this.validarFormulario(form, true);

      if (!estavaDisabled) {
        indicadoresProjetoControl?.enable({ emitEvent: false });
      }

      if (!formValido) {
        return;
      }

      form.get('valor.tipo')?.enable();
      form.get('valor.moeda')?.enable();

      const odsProjetoPayload = this.projetoForm.getRawValue()
        .odsProjeto
        ?.map((ods: any) => ({
          idOdsProjeto: ods.idOdsProjeto ?? null,
          odsId: ods.odsId,
          odsOrdem: ods.odsOrdem,
          odsNome: ods.odsNome,
          odsDescricao: ods.odsDescricao
        })) ?? [];

      const payload =
        new ProjetoFormModel(form.getRawValue() as IProjetoForm);

      if (this.isProponente) {
        payload.idOrganizacao =
          form.get('idOrganizacao')?.value;
      }

      payload.indicadoresProjeto = indicadoresProjetoPayload;
      payload.indicadoresAvulsosProjeto = indicadoresAvulsosPayload;
      payload.odsProjeto = odsProjetoPayload;

      if (!this.validarIndicadores(payload.indicadoresProjeto, payload.indicadoresAvulsosProjeto)) {
        return;
      }

      ////////////////////////////
      // const payload = new ProjetoFormModel(form.value as IProjetoForm);
      // payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;

      this.autuarProjetoAsync(payload);

    });
  }

  private efetivarEnvioParecerProjetoForm(form: FormGroup): void {

    form.updateValueAndValidity();

    form.get('valor.tipo')?.enable();
    form.get('valor.moeda')?.enable();

    const indicadoresProjetoPayload = this.projetoForm.getRawValue()
      .indicadoresProjeto
      .filter((indicador: IIndicadores) =>
        (indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno ?? 0) !== 0
      )
      .map((indicador: IIndicadores) => ({
        idIndicador: indicador.idIndicador,
        tipoIndicador: indicador.tipoIndicador ?? null,
        descricaoIndicador: indicador.descricaoIndicador ?? null,
        descricaoMeta: indicador.descricaoMeta ?? null,
        idStatus: indicador.idStatus ?? 1,
        idIndicadorExterno: indicador.idIndicadorExterno ?? indicador.idIndicadorCatalogoExterno,
        metasIndicadorProjeto: indicador.metasIndicadorProjeto?.map(meta => ({
          id: meta.id,
          anoMeta: meta.anoMeta,
          valorMeta: meta.valorMeta
        })) ?? []
      }));

    const indicadoresAvulsosPayload = this.projetoForm.getRawValue()
      .indicadoresAvulsosProjeto
      .filter((indicador: IIndicadorAvulso) => indicador?.nomeIndicador?.trim())
      .map((indicador: IIndicadorAvulso) => ({
        id: indicador.id ?? null,
        idIndicadorAvulso: indicador.idIndicador ?? null,
        indicadorAvulso: {
          id: indicador.idIndicador ?? null,
          nomeIndicador: indicador.nomeIndicador,
          unidadeMedida: indicador.unidadeMedida,
          fonteIndicador: indicador.fonteIndicador,
          medidoPor: indicador.medidoPor,
          baseDeReferencia: indicador.basedeReferencia
        },
        metasIndicadorProjeto: indicador.metasIndicadorProjeto
      }));


    const indicadoresProjetoControl = this.projetoForm.get('indicadoresProjeto');
    const estavaDisabled = indicadoresProjetoControl?.disabled;

    indicadoresProjetoControl?.disable({ emitEvent: false });

    if (!estavaDisabled) {
      indicadoresProjetoControl?.enable({ emitEvent: false });
    }

    const odsProjetoPayload = this.projetoForm.getRawValue()
      .odsProjeto
      ?.map((ods: any) => ({
        idOdsProjeto: ods.idOdsProjeto ?? null,
        odsId: ods.odsId,
        odsOrdem: ods.odsOrdem,
        odsNome: ods.odsNome,
        odsDescricao: ods.odsDescricao
      })) ?? [];

    const payload =
      new ProjetoFormModel(form.getRawValue() as IProjetoForm);

    payload.indicadoresProjeto = indicadoresProjetoPayload;
    payload.indicadoresAvulsosProjeto = indicadoresAvulsosPayload;
    payload.odsProjeto = odsProjetoPayload;

    const formData = new FormData();

    formData.append(
      'projeto',
      new Blob([JSON.stringify(payload)], {
        type: 'application/json'
      })
    );

    if (this.arquivoParecerSelecionado) {
      formData.append('arquivoParecerAnexo', this.arquivoParecerSelecionado);
    }

    payload.idOrganizacao = this.projetoForm.get('idOrganizacao')?.value;

    this.efetivarEnvioParecerProjetoAsync(formData);

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
      .enviarEmailRevisarProjeto(
        this._idProjetoEdicao,
        this.projetoForm.get('justificativaRevisao')?.value,
      )
      .subscribe({
        next: (response: string) => {
          this._toastService.showToast('success', response);
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        },
        error: (err) => {
          this._toastService.showToast(
            'error',
            'Erro ao enviar revisão: ' + err,
          );
        },
      });
  }

  private enviarProjetoArquivamentoForm(): void {
    const textoJustificativa = this.projetoForm.get(
      'justificativaArquivamento',
    )?.value;
    const codigoMotivoArquivamento = this.projetoForm.get(
      'codigoMotivoArquivamento',
    )?.value;

    this._projetosService
      .enviarEmailArquivarProjeto(
        this._idProjetoEdicao,
        textoJustificativa,
        codigoMotivoArquivamento,
      )
      .subscribe({
        next: (response: string) => {
          this._toastService.showToast('success', response);
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        },
        error: (err) => {
          this._toastService.showToast(
            'error',
            'Erro ao enviar aviso de arquivamento: ' + err,
          );
        },
      });
  }

  private enviarProjetoComplementacao(): void {

    const possuiComplemento = this.camposParaComplementacao.some(
      (campo) => (campo.mensagemComplementacao?.length ?? 0) > 0,
    );

    if (!possuiComplemento) {
      this._toastService.showToast('error', 'Nenhum complemento informado.');
      return;
    }

    this.exibeListaEtapasIntegracao = true;

    this.loading = true;

    this._projetosService
      .enviarEmailAvisoComplementacaoProjeto(
        this._idProjetoEdicao,
        this.camposParaComplementacao,
      )
      .pipe(
        tap(() => {

          this._toastService.showToast(
            'info',
            'Envio de aviso de complementação iniciado no E-Docs.',
          );

          this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);

          this.iniciarPollingEtapasIntegracaoModal();

        }),

        catchError(() => {

          this.exibeListaEtapasIntegracao = false;

          this.loading = false

          this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);

          this._toastService.showToast(
            'error',
            'Erro ao iniciar o envio de aviso de complementação.',
          );

          return EMPTY;

        }),

        finalize(() => {
          this.loading = false
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),

      )
      .subscribe();

  }

  private reentranharDicProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService
      .reentranharDicEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {

          this.autuacaoAcionada = true;

          this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);

          this._toastService.showToast(
            'info',
            'Processo reentranhar DIC com correções iniciado no E-Docs.',
          );

          this.iniciarPollingEtapasIntegracaoModal();

        }),

        catchError(() => {

          this.autuacaoAcionada = false;
          this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);

          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.',
          );

          return EMPTY;

        }),

        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),

      )
      .subscribe();

  }

  private autuarProjetoAsync(payload: ProjetoFormModel): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService
      .autuarProjetoEdocs(this._idProjetoEdicao, payload)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de autuação iniciado no E-Docs.',
          );
        }),

        // catchError((error) => {
        //   console.error(' autuarProjetoAsync Erro ao iniciar autuação no E-Docs:', error);
        //   this.autuacaoAcionada = false;
        //   if (
        //     error.status === 401 &&
        //     error.error?.titulo === 'EDOCS_TOKEN_EXPIRADO'
        //   ) {
        //     return throwError(() => error);
        //   }
        //   this._toastService.showToast(
        //     'error',
        //     'Erro ao iniciar autuação no E-Docs.',
        //   );
        //   return EMPTY;
        // }),

        // catchError((error) => {
        //   this.autuacaoAcionada = false;
        //   this._toastService.showToast(
        //     'error',
        //     'Erro ao iniciar autuação no E-Docs.',
        //   );
        //   return of([]);
        // }),

        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),

      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal();
      });
  }

  private efetivarEnvioParecerProjetoAsync(formData: FormData): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService
      .efetivarEnvioParecerEdocs(this._idProjetoEdicao, formData)
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de autuação iniciado no E-Docs.',
          );
        }),
        catchError((error) => {
          this.autuacaoAcionada = false;
          this.assinarAutuar = true;
          this.exibeListaEtapasIntegracao = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar autuação no E-Docs.',
          );
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal();
      });
  }

  private efetivarEntranhamentoPareceresProjetoAsync(
    payload: ProjetoFormModel,
  ): void {

    this.exibeListaEtapasIntegracao = true;

    this._projetosService
      .efetivarEntranhamentoPareceresProjetoEdocs(
        this._idProjetoEdicao,
        payload,
      )
      .pipe(
        tap(() => {
          this.autuacaoAcionada = true; // usado para desabilitar o botao na modal..
          this._toastService.showToast(
            'info',
            'Processo de entranhamento de pareceres do DIC iniciado no E-Docs.',
          );
        }),
        catchError((error) => {
          this.autuacaoAcionada = false;
          this._toastService.showToast(
            'error',
            'Erro ao iniciar entranhamento de pareceres do DIC no E-Docs.',
          );
          return of([]);
        }),
        finalize(() => {
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),
      )
      .subscribe(() => {
        this._projetosService.adicionarProjetoAguardando(this._idProjetoEdicao);
        this.iniciarPollingEtapasIntegracaoModal();
      });
  }

  private pararPolling$ = new Subject<void>();

  private iniciarPollingEtapasIntegracaoModal(): void {

    const INTERVALO = 2000;

    interval(INTERVALO)
      .pipe(

        switchMap(() =>
          this._projetosService
            .consultarFasesIntegracaoEdcosProjeto(this._idProjetoEdicao)
            .pipe(

              tap((response) => {
                // console.log('Response da API:', response);
              }),

              map((response) =>
                response.map(
                  (fase) => new ProjetoIntegracaoEdocsFasesModel(fase),
                ),
              ),

            ),
        ),

        filter((lista) => lista.length > 0),

        tap((lista) => {
          this.atualizarStatusUI(lista);
        }),

        // Espera até chegar em um estado terminal:
        // erro OU todas finalizadas.
        filter((lista) => {

          const possuiErro =
            lista.some((fase) => fase.erro);

          const todasFinalizadas =
            lista.every((fase) => fase.finalizada);

          return possuiErro || todasFinalizadas;
        }),

        // A primeira condição terminal encerra o polling.
        take(1),

        tap((lista) => {

          const faseComErro =
            lista.find((fase) => fase.erro);

          if (faseComErro) {

            this.autuacaoAcionada = false;

            this._projetosService.removerProjetoAguardando(
              this._idProjetoEdicao
            );

            this.tratarErro(faseComErro);

            return;
          }

          // Se chegou aqui, terminou com sucesso.
          this._projetosService.removerProjetoAguardando(
            this._idProjetoEdicao
          );

          // notificar a lista para que ela carregue novamente..
          this._projetosService.notificarAtualizacaoLista();

          this.assinarAutuar = false;
          this.finalizadoProcessamentoIntegracao = true;
          this.autuacaoAcionada = false;

          // this._projetosService.notificarAtualizacaoLista();

          // this.executarAcaoBreadcrumb(
          //   BreadcrumbAcoesEnum.Cancelar
          // );

        }),

        finalize(() => {
          this.autuacaoAcionada = false;
          this.cdr.detectChanges();
        }),

      )
      .subscribe({
        error: (err) => {

          console.error(
            'Erro ao consultar fases da integração:',
            err
          );

          this.autuacaoAcionada = false;

          this._projetosService.removerProjetoAguardando(
            this._idProjetoEdicao
          );

          this._toastService.showToast(
            'error',
            'Erro ao consultar andamento da integração com o E-Docs.',
          );
        }

      });

  }

  private atualizarStatusUI(lista: ProjetoIntegracaoEdocsFasesModel[]) {
    lista.forEach((fase) => {
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
    });
  }

  private tratarErro(fase: ProjetoIntegracaoEdocsFasesModel): void {

    this.autuacaoAcionada = false;

    this.erroEmAlgumaFaseModalAutuacao = true;

    if ((fase.msgAlertaExibir?.length ?? 0) > 0) {

      this._toastService.showToast('warning', fase.msgAlertaExibir);

      if (fase.tokenExpirado) {
        this._ngbModalService.dismissAll();
        this._router.navigateByUrl('login');
      }

      return;

    } else {
      this._toastService.showToast(
        'error',
        'Ocorreu erro na integração com o E-Docs.',
      );
    }

    this._projetosService.removerProjetoAguardando(this._idProjetoEdicao);

    this.pararPolling$.next();

    this.cdr.detectChanges();

  }

  ngOnDestroy(): void {
    this.pararPolling$.next();
    this.pararPolling$.complete();
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
    const controlJustificativaArquivamento = this.projetoForm.get(
      'justificativaArquivamento',
    );
    const codigoMotivoArquivamento = this.projetoForm.get(
      'codigoMotivoArquivamento',
    );

    if (
      codigoMotivoArquivamento?.value == null ||
      codigoMotivoArquivamento?.value?.trim() === ''
    ) {
      this._toastService.showToast(
        'error',
        'Informe o motivo para arquivamento.',
      );
      return;
    }

    // se clicar na opcao outros obriga o preenchimento da justificativa.
    if (codigoMotivoArquivamento?.value?.trim() === 'M11') {
      controlJustificativaArquivamento?.setValidators([
        Validators.required,
        Validators.maxLength(200),
      ]);
      controlJustificativaArquivamento?.updateValueAndValidity();
      if (
        !controlJustificativaArquivamento ||
        controlJustificativaArquivamento.invalid ||
        !controlJustificativaArquivamento.value?.trim()
      ) {
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

  private erroNaFaseIntegracao(
    faseIntegracao: FasesEdocsIntegracaoEnum,
  ): boolean {
    return (
      this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.some(
        (fase) =>
          fase.etapa == faseIntegracao &&
          fase.erro &&
          (fase.msgAlertaExibir?.length ?? 0) == 0,
      )
    );
  }

  public possuiMensagemAlerta(): boolean {
    return (
      this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.some(
        (fase) => fase.erro && (fase.msgAlertaExibir?.trim().length ?? 0) > 0,
      )
    );
  }

  public classeCssMensagemAlerta(): string {
    return this.possuiMensagemAlerta()
      ? 'btn btn-danger icon-text-btn me-2 d-inline-flex align-items-center'
      : 'btn btn-warning icon-text-btn me-2 d-inline-flex align-items-center';
  }

  public isIntegracaoEdocsConcluido(): boolean {
    if (
      this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.every((fase) => fase.finalizada)
    ) {
      return true;
    }

    return false;
  }

  public isReentramentoEdocsConcluido(): boolean {
    if (
      this.listaFasesIntegracaoProjeto.length > 0 &&
      this.listaFasesIntegracaoProjeto.every((fase) => fase.finalizada)
    )
      return true;
    return false;
  }

  confirmarComplementacao(modal: NgbModalRef): void {
    modal.close('confirmado');
  }

  public abrirComplementacaoModal() {
    const modalRef = this._ngbModalService.open(
      this.informarComplementacoesProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.enviarProjetoComplementacao();
      }
    });
  }

  public abrirEfetivarParecerModal() {
    const parecerControl = this.projetoForm.get(
      'parecerProjetoUsuario',
    ) as FormGroup;

    if (parecerControl.invalid) {
      parecerControl.markAllAsTouched();
      if (!this.validarFormulario(parecerControl, true)) return;
    }

    const modalRef = this._ngbModalService.open(
      this.efetivarParecerProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.confirmarAssinarCapturarParecer();
      }
    });
  }

  public abrirEntranhamentoPareceresModal() {
    const modalRef = this._ngbModalService.open(
      this.entranharPareceresEdocsProjetoModalTemplate,
      {
        centered: true,
        size: 'lg',
      },
    );

    modalRef.result.then((result) => {
      if (result === 'confirmado') {
        this.confirmarEntranhamentoParecerProcessoEdocs();
      }
    });

  }

  public irParaIndicadores(event: MouseEvent): void {

    event.preventDefault();

    if (!this.validarAbaDic()) {
      this._toastService.showToast('warning', 'Erro ao avançar', [
        'Verifique os campos obrigatórios antes de continuar.',
      ]);
      this.abrirAba('nav-propriedades');
      return;
    }

    this.abrirAba('nav-indicadores');

  }

  public irParaPlanejamento(event: MouseEvent): void {

    event.preventDefault();

    if (this.statusProjeto === StatusProjetoEnum.Em_Elaboracao) {
      if (!this.validarAbaDic()) {
        this._toastService.showToast('warning', 'Erro ao avançar', [
          'Verifique os campos obrigatórios antes de continuar.',
        ]);
        return;
      }
    }

    this.abrirAba('nav-planejamento');

  }

  public irParaOds(event: MouseEvent): void {

    event.preventDefault();

    if (this.statusProjeto === StatusProjetoEnum.Em_Elaboracao) {
      if (!this.validarAbaDic()) {
        this._toastService.showToast('warning', 'Erro ao avançar', [
          'Verifique os campos obrigatórios antes de continuar.',
        ]);
        return;
      }
    }

    const campoOds = this.projetoForm.get('impactos');

    campoOds?.clearValidators();
    campoOds?.updateValueAndValidity();

    campoOds?.setValidators([Validators.required]);
    campoOds?.updateValueAndValidity();

    this.abrirAba('nav-ods-indicadores');

  }

  private abrirAba(idBotaoAba: string): void {
    const trigger = document.getElementById(idBotaoAba);

    if (!trigger) {
      return;
    }

    bootstrap.Tab.getOrCreateInstance(trigger).show();
  }

  private validarAbaDic(): boolean {
    let valido = true;
    this.camposObrigatoriosDic.forEach(nome => {
      const control = this.projetoForm.get(nome);
      if (control?.invalid) {
        control.markAsTouched();
        control.markAsDirty();
        valido = false;
      }
    });
    return valido;
  }

  public baixarPdfAnexo(idParecer: any): void {

    this.parecerService.baixarParecer(idParecer);

  }

  get parecerFormGroup(): FormGroup {
    return this.projetoForm.get('parecerProjetoUsuario') as FormGroup;
  }

  public onIndicadoresCatalogoCarregados(
    catalogo: IIndicadoresCatalogoExterno[]
  ): void {
    this.indicadoresCatalogoBI = catalogo;
    this.enriquecerIndicadoresProjetoComCatalogo(catalogo);
  }

  private enriquecerIndicadoresProjetoComCatalogo(
    catalogo: IIndicadoresCatalogoExterno[]): void {

    const indicadoresControl = this.projetoForm.get('indicadoresProjeto');
    const indicadoresProjeto = indicadoresControl?.value ?? [];

    if (!indicadoresProjeto.length || !catalogo.length) {
      return;
    }

    const indicadoresEnriquecidos: IIndicadoresCatalogoExterno[] = indicadoresProjeto.map((indicadorProjeto: any) => {
      const idIndicador =
        indicadorProjeto.idIndicadorExterno ??
        indicadorProjeto.idIndicadorCatalogoExterno ??
        indicadorProjeto.idIndicador;

      const indicadorCatalogo = catalogo.find(
        (i) => i.idIndicador === idIndicador
      );

      return {
        ...indicadorProjeto,
        nomeIndicador:
          indicadorProjeto.nomeIndicador ?? indicadorCatalogo?.nomeIndicador,
        unidadeMedida:
          indicadorProjeto.unidadeMedida ?? indicadorCatalogo?.unidadeMedida,
        formulaCalculo:
          indicadorProjeto.formulaCalculo ?? indicadorCatalogo?.formulaCalculo,
        polaridade:
          indicadorProjeto.polaridade ?? indicadorCatalogo?.polaridade,
        medidoPor:
          indicadorProjeto.medidoPor ?? indicadorCatalogo?.medidoPor,
        metasIndicador:
          indicadorProjeto.metasIndicador ?? indicadorCatalogo?.metasIndicador,
        ods: indicadorCatalogo?.ods ?? []
      };

    });

    indicadoresControl?.patchValue(indicadoresEnriquecidos);

  }

  parecerPossuiAnexo(parecer: IParecer): boolean {
    return parecer?.nomeArquivo?.trim().length > 0;
  }

  private obterPendenciasProjeto(
    abas?: AbaProjeto[],
  ): IPendenciaProjeto[] {

    const pendencias: IPendenciaProjeto[] = [];

    const deveValidarAba = (aba: AbaProjeto): boolean =>
      !abas || abas.includes(aba);

    this.projetoForm.updateValueAndValidity({
      emitEvent: false,
    });

    this.camposValidacao.forEach((campo) => {

      if (!deveValidarAba(campo.aba)) {
        return;
      }

      const control = this.projetoForm.get(campo.path);

      if (!control) {
        console.warn(
          `Controle não encontrado na validação: ${campo.path}`,
        );
        return;
      }

      if (control.invalid) {
        pendencias.push({
          id: campo.path,
          aba: campo.aba,
          nomeAba: campo.nomeAba,
          campo: campo.campo,
          mensagem: this.obterMensagemErroControle(
            campo.campo,
            control,
          ),
          controlPath: campo.path,
        });
      }
    });

    if (deveValidarAba('propriedades')) {

      const equipe =
        (this.projetoForm.get('equipeElaboracao')?.value ?? []) as IEquipe[];

      const possuiMembroAtivo =
        equipe.some(
          (membro: IEquipe) =>
            membro.idStatus === TipoStatusEnum.Ativo &&
            membro.idPapel !== TipoPapelEnum.Redator,
        );

      if (!possuiMembroAtivo) {
        pendencias.push({
          id: 'equipeElaboracao',
          aba: 'propriedades',
          nomeAba: 'DIC',
          campo: 'Equipe de Elaboração',
          mensagem:
            'Informe pelo menos um membro ativo além do Redator.',
          controlPath: 'equipeElaboracao',
        });
      }
    }

    if (deveValidarAba('propriedades')) {

      const acoes =
        (this.projetoForm.get('acoesProjeto')?.value ?? []) as IAcao[];

      const possuiAcaoAtiva =
        acoes.some(
          (acao: IAcao) =>
            acao.idStatus === TipoStatusEnum.Ativo,
        );

      if (!possuiAcaoAtiva) {

        pendencias.push({
          id: 'acoesProjeto',
          aba: 'propriedades',
          nomeAba: 'DIC',
          campo: 'Ações do Projeto',
          mensagem:
            'Informe pelo menos uma ação do projeto.',
          controlPath: 'acoesProjeto',
        });

      }

      if (!this.compararValorEstimadoValorAcoes()) {

        pendencias.push({
          id: 'acoesProjeto',
          aba: 'propriedades',
          nomeAba: 'DIC',
          campo: 'Ações do Projeto',
          mensagem:
            'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.',
          controlPath: 'acoesProjeto',
        });

      }

    }

    if (deveValidarAba('indicadores')) {

      const indicadores =
        (this.projetoForm.get('indicadoresProjeto')?.value ?? []) as IIndicadores[];

      const indicadoresAvulsos =
        (this.projetoForm.get('indicadoresAvulsosProjeto')?.value ?? []) as IIndicadorAvulso[];

      if (
        indicadores.length === 0 &&
        indicadoresAvulsos.length === 0
      ) {
        pendencias.push({
          id: 'indicadores',
          aba: 'indicadores',
          nomeAba: 'Indicadores',
          campo: 'Indicadores',
          mensagem:
            'Informe pelo menos um indicador.',
        });
      }

      const algumIndicadorSemMeta =
        indicadores.some((indicador: any) =>
          indicador.metasIndicadorProjeto?.some(
            (meta: any) => !meta.valorMeta,
          ),
        ) ||
        indicadoresAvulsos.some((indicador: any) =>
          indicador.metasIndicadorProjeto?.some(
            (meta: any) => !meta.valorMeta,
          ),
        );

      if (algumIndicadorSemMeta) {
        pendencias.push({
          id: 'metasIndicadores',
          aba: 'indicadores',
          nomeAba: 'Indicadores',
          campo: 'Metas dos Indicadores',
          mensagem:
            'Preencha todas as metas dos indicadores.',
        });
      }
    }

    if (deveValidarAba('planejamento')) {

      const valorPlanejamento =
        this.projetoForm.get('acoesPlanejamentoProjeto')?.value;

      const acoesPlanejamento =
        Array.isArray(valorPlanejamento)
          ? valorPlanejamento
          : [];

      const naoPrevistoNoPpa =
        this.projetoForm.get('naoPrevistoNoPpa')?.value === true;

      if (
        acoesPlanejamento.length === 0 &&
        !naoPrevistoNoPpa
      ) {
        pendencias.push({
          id: 'planejamentoPpa',
          aba: 'planejamento',
          nomeAba: 'Planejamento',
          campo: 'Planejamento PPA',
          mensagem:
            'Informe uma ação de planejamento ou marque que o projeto não está previsto no PPA.',
        });
      }
    }

    return pendencias;

  }

  private obterMensagemErroControle(
    nomeCampo: string,
    control: AbstractControl,
  ): string {

    if (control.hasError('required')) {
      return `${nomeCampo} é obrigatório.`;
    }

    if (control.hasError('maxlength')) {
      const limite =
        control.getError('maxlength')?.requiredLength;

      return `${nomeCampo} deve possuir no máximo ${limite} caracteres.`;
    }

    if (control.hasError('minlength')) {
      const limite =
        control.getError('minlength')?.requiredLength;

      return `${nomeCampo} deve possuir no mínimo ${limite} caracteres.`;
    }

    return `${nomeCampo} possui informação inválida.`;

  }

  // private validarProjeto(
  //   abas?: AbaProjeto[],
  // ): boolean {
  //   this.pendenciasProjeto =
  //     this.obterPendenciasProjeto(abas);
  //   this.marcarCamposPendentes(
  //     this.pendenciasProjeto,
  //   );
  //   return this.pendenciasProjeto.length === 0;
  // }

  // private marcarCamposPendentes(
  //   pendencias: IPendenciaProjeto[],
  // ): void {
  //   pendencias.forEach((pendencia) => {
  //     if (!pendencia.controlPath) {
  //       return;
  //     }
  //     const control =
  //       this.projetoForm.get(
  //         pendencia.controlPath,
  //       );
  //     control?.markAsTouched();
  //     control?.markAsDirty();
  //   });
  // }

  public abrirModalPendencias(pendencias: IPendenciaProjeto[]): void {

    this.showModalPendencias = true

    this.pendenciasProjeto = pendencias;

    // this.obterPendenciasProjeto();

  }

  public irParaPendencia(pendencia: IPendenciaProjeto,): void {

    this.showModalPendencias = false;

    this.abrirAbaPendencia(pendencia.aba);

    setTimeout(() => {

      if (!pendencia.controlPath) {
        return;
      }

      const elemento =
        document.querySelector<HTMLElement>(
          `[data-control-path="${pendencia.controlPath}"]`,
        );

      if (!elemento) {
        this._toastService.showToast('warning', 'Campo não encontrado:', [pendencia.controlPath,]);
        console.warn(
          'Campo não encontrado:',
          pendencia.controlPath,
        );
        return;
      }

      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      this.projetoForm
        .get(pendencia.controlPath)
        ?.markAsTouched();

      const campo =
        elemento.querySelector<HTMLElement>(
          'input, textarea, select, [tabindex]',
        );

      campo?.focus();

    }, 150);

  }

  private abrirAbaPendencia(aba: AbaProjeto): void {

    const abas: Record<AbaProjeto, string> = {
      propriedades: 'nav-propriedades',
      indicadores: 'nav-indicadores',
      ods: 'nav-ods-indicadores',
      planejamento: 'nav-planejamento',
    };

    this.abrirAba(abas[aba]);

  }

  private salvarRascunho(): void {

    const pendencias = this.obterPendenciasRascunho();

    if (pendencias.length) {
      this.abrirModalPendencias(pendencias);
      return;
    }

    this.submitProjetoForm(
      this.projetoForm,
      true,
      false
    );

  }

  private obterPendenciasRascunho(): IPendenciaProjeto[] {

    const pendencias: IPendenciaProjeto[] = [];

    const sigla = this.projetoForm.get('sigla');
    const titulo = this.projetoForm.get('titulo');
    const organizacao = this.projetoForm.get('idOrganizacao');
    const equipe = this.projetoForm.get('equipeElaboracao');

    if (!sigla?.value?.trim()) {
      pendencias.push({
        id: 'sigla',
        aba: 'propriedades',
        nomeAba: 'Dados do DIC',
        campo: 'Sigla',
        mensagem: 'Informe a sigla.'
      });
    }

    if (!titulo?.value?.trim()) {
      pendencias.push({
        id: 'titulo',
        aba: 'propriedades',
        nomeAba: 'Dados do DIC',
        campo: 'Título',
        mensagem: 'Informe o título.'
      });
    }

    if (!organizacao?.value) {
      pendencias.push({
        id: 'idOrganizacao',
        aba: 'propriedades',
        nomeAba: 'Dados do DIC',
        campo: 'Órgão Proponente',
        mensagem: 'Informe o órgão proponente.'
      });
    }

    const equipeElaboracao = equipe?.value ?? [];

    if (!equipeElaboracao.length) {
      pendencias.push({
        id: 'equipeElaboracao',
        aba: 'propriedades',
        nomeAba: 'Equipe de Elaboração',
        campo: 'Equipe de Elaboração',
        mensagem: 'Informe pelo menos um integrante da equipe.'
      });
    }

    return pendencias;

  }

  private salvarEEnviar(): void {

    const pendencias = this.obterPendenciasProjeto();

    if (pendencias.length) {
      this.abrirModalPendencias(pendencias);
      return;
    }

    this.projetoForm.patchValue({enviarProjetoGestor: true,});
    
    this.validacaoSomaValoresAcoesEnviar(this.projetoForm);

    this.submitProjetoForm(
      this.projetoForm,
      false,
      true
    );

  }

}
