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
  catchError,
  Subject,
  merge,
  debounceTime,
  distinctUntilChanged,
  of
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
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { IAcao } from '../../../core/interfaces/acoes.interface';

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
  public pessoasOpcoesGoves: IOpcoesDropdownResponsavelProponente[] = [];
  public equipeProjeto: IEquipe[] = [];

  public planosOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];
  public localidadesOpcoes: ILocalidadeOpcoesDropdown[] = [];
  public microrregioesOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoesVisiveis: IOpcoesDropdown[] = [];

  public indicadoresOpcoes: IOpcoesDropdown[] = [];

  public statusProjeto: string = '';
  public statusProjetoNovo: string | null = null;
  public statusProjetoOpcoes: Array<string> = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeElaboracao:  | null = null;

  public idIndicadorIndicadores:  | null = null;

  public isLoadingPessoas = true;

  public isLoadingPessoasFiltroTermo = false;

  public exibirLista = true;

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
            tap((response: IProjeto) => {
            }),
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
              this.loading = false;
              this.isLoadingPessoasFiltroTermo = false;
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

        this.equipeProjeto = projetoModel.equipeElaboracao; 

        this.trocarModo(false);

        if ( this.isProponente ) {

          if ( projetoModel.status == StatusProjetoEnum.Em_Analise ) 
            this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
              this._projetosService.gerarBotoesAcaoFormularioProponenteEmAnalise()
            );
          else {

            this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
              this._projetosService.gerarBotoesAcaoFormularioProponente()
            );

            this.trocarModo(true); //permite editar

          }

        } else {
          this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
            this._projetosService.gerarBotoesAcaoFormulario()
          );
          // Workaround para carregar o componente de rateio quando modo de edição
          setTimeout( () => {this.trocarModo(true);}, 2000 );
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

    this._getAllOpcoes$ = concat(
      this._getOrganizacoesOpcoes$,
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
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );

  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());
    this._subscription.add(this._atualizarProjeto$.subscribe());
    this._subscription.add(this._cadastrarProjeto$.subscribe());
    this._pessoasService.buscarTodosAgentesPublicosGoves().subscribe({
      error: (err) => console.error('Erro ao carregar em cache lista de todos agentes públicos ligados ao Governo :', err)
    });
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
    ) || [pessoasOpcoes[0]]; 
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
    });

    this.projetoFormValueChanges();
    
    this.valorFormValueChanges();

    if ( this.isProponente && !projetoFormModel )
      this.usuarioProponenteValoresIniciaisProjetoForm();
    
  }
  
  private usuarioProponenteValoresIniciaisProjetoForm(): void {

    const idOrganizacaoFormControl = this.projetoForm.get('idOrganizacao') as FormControl<number | null>;
    
    idOrganizacaoFormControl.patchValue(this.usuario_IdOrganizacoes[0]);
  
    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    if ( idResponsavelProponenteFormControl.value === 0 ) {
  
      this.pessoasOpcoes = [];
      this.isLoadingPessoas = true;
    
      this._pessoasService
        .buscarResponsavelPorIdOrganizacaoAC(this.usuario_IdOrganizacoes[0])
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
          },
          error: () => {
            this.pessoasOpcoes = this.pessoasOpcoesFiltrada = [];
            this.isLoadingPessoas = false;
          },
        });

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
    this.pessoasOpcoes = [];

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
                nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toUpperCase,
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

    } else {

      this._pessoasService
        .buscarResponsavelPorIdOrganizacaoAC(idOrganizacaoValue)
        .subscribe({
          next: (response) => {
            this.pessoasOpcoes = this.pessoasOpcoesFiltrada = response;
            this.isLoadingPessoas = false;
            
            const  indexGestor = this.pessoasOpcoes.findIndex(
                pessoa => pessoa.agentePublicoSub === subResponsavelProponente.value
              );
            
            if( indexGestor > 0 ){
              this.projetoForm.patchValue({
                idResponsavelProponente: this.pessoasOpcoes[indexGestor].id,
                nomeResponsavelProponente: this.pessoasOpcoes[indexGestor].nome.toUpperCase,
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
        this.validacaoSomaValoresAcoesEnviar(this.projetoForm, false);
        break;
    }
  }

  private validacaoSomaValoresAcoesEnviar(form: FormGroup, isRascunho: boolean): void {
    if (this.compararValorEstimadoValorAcoes()) {
      this.submitProjetoForm(form, false);
    }else{
      this._toastService.showToast('error', 'Valor estimado do projeto incompativel com somatorio de valores informado nas ações.', 
        ['A soma dos valores estimado das ações deve ser igual ao valor estimado do projeto.',]);
    }
  }

  private compararValorEstimadoValorAcoes(): boolean {
    
    const valorEstimadoProjeto = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number>;

    const acoesProjetoValues = this.projetoForm.get('acoesProjeto')?.value;

    if (!acoesProjetoValues) return false;

    const totalValorAcoesInformadas = acoesProjetoValues.reduce((sum: number, acao: { valorEstimadoAcaoPrincipal: any; }) => {
      const valor = Number(acao.valorEstimadoAcaoPrincipal) || 0;
      return sum + valor;
    }, 0);

    const valorA = Number(totalValorAcoesInformadas) || 0;
    const valorB = Number(valorEstimadoProjeto.value) || 0;

    return Math.abs(valorA - valorB) < 0.001;

  }
  
  private trocarModo(permitir: boolean): void {

    this.isModoEdicao = permitir;

    const projetoFormControls = this.projetoForm.controls;

    alterarEstadoControlesFormulario(permitir, projetoFormControls);

    // Caso especifico de Projetos; tipo do valor somente pode ser 'Estimado'
    this.projetoForm.get('valor.tipo')?.disable();
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
        nomeResponsavelProponente: pessoa.nome.toUpperCase,
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

  public buscarAgentesPorTermo(): IOpcoesDropdownResponsavelProponente[] {
    
    this.isLoadingPessoasFiltroTermo = true;
    
    const termo = this.projetoForm.get('nomeagente')?.value;

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

      },
      error: () => {
        this.pessoasOpcoesGoves = [];
        this.isLoadingPessoasFiltroTermo = false;
      }

    });
    
    return this.pessoasOpcoesGoves;

  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._rateioService.resetarRateio();
    this._projetosService.idProjeto$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

}
