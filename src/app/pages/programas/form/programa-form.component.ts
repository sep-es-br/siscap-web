import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import {
  concat,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  partition,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ProgramaProjetoPropostoVinculadoWarningModalComponent } from '../../../shared/templates/programa-projeto-proposto-vinculado-warning-modal/programa-projeto-proposto-vinculado-warning-modal.component';

import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import {
  ProgramaFormModel,
  ProgramaModel,
} from '../../../core/models/programa.model';

import { TBotaoAcao } from '../../../shared/components/botao/botao.config';

import {
  IPrograma,
  IProgramaForm,
  StatusAssinaturaPrograma,
  StatusPrograma,
} from '../../../core/interfaces/programa.interface';
import {
  IProjetoPropostoOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownResponsavelProponente,
  IPapeisOrgaoProgramaDropdownOpcoes,
} from '../../../core/interfaces/opcoes-dropdown.interface';
import { IMoeda } from '../../../core/interfaces/moeda.interface';

import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { MoedaHelper } from '../../../core/helpers/moeda.helper';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { getSimboloMoeda } from '../../../core/utils/functions';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { TipoValorEnum } from '../../../core/enums/tipo-valor.enum';
import { ProgramaProjetoPropostoParecerGeocEnviadoWarningModalComponent } from '../../../shared/templates/programa-projeto-proposto-parecer-geoc-enviado-warning-modal/programa-projeto-proposto-parecer-geoc-enviado-warning-modal.component';
import { ConfirmationModalComponent } from '../../../shared/templates/confirmation-modal/confirmation-modal.component';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { PapelOrgaoPrograma } from '../../../core/enums/orgaos.enum';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';

@Component({
  selector: 'siscap-programa-form',
  standalone: false,
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.scss',
})
export class ProgramaFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _subscription: Subscription = new Subscription();

  private readonly _atualizarPrograma$: Observable<IPrograma>;
  private readonly _cadastrarPrograma$: Observable<number>;

  private readonly _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getProjetosPropostosOpcoes$: Observable<
    IProjetoPropostoOpcoesDropdown[]
  >;
  private readonly _getProgramasOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<any>;

  private _idProgramaEdicao: number = 0;

  public loading: boolean = true;

  public programaForm: FormGroup = new FormGroup({});

  public organizacoesOpcoes: IPapeisOrgaoProgramaDropdownOpcoes[] = [];
  public pessoasOpcoes: IOpcoesDropdownResponsavelProponente[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];
  public projetosPropostosOpcoes: IProjetoPropostoOpcoesDropdown[] = [];
  public programasOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeCaptacao: number | null = null;
  public idProjetoProposto: number | null = null;

  public pessoasOpcoesGoves: IOpcoesDropdownResponsavelProponente[] = [];
  public isLoadingPessoasFiltroTermo = false;
  public exibirLista = true;
  public tiposPapelOpcoesVisiveis: IOpcoesDropdown[] = [];
  public equipeCaptacao: IEquipe[] = [];

  public projetoTooltip: Record<string, string> =
      COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  public mostrarBotaoBaixarPrograma: boolean = false;

  public programaAtual!: IPrograma;

  public statusProgramaAtual: StatusPrograma = StatusPrograma.EDICAO;

  get orgaosSelecionados(): Array<IPapeisOrgaoProgramaDropdownOpcoes> {
    const orgaosSelecionadosIds: Array<number> = this.programaForm.controls['orgaosEnvolvidosList'].value;

    return this.organizacoesOpcoes.filter((el) => orgaosSelecionadosIds.includes(el.id));
  }

  get isProgramaAtualEditavel(): boolean {
    return this.statusProgramaAtual === StatusPrograma.EDICAO;
  }

  constructor(
    public valorService: ValorService,
    private readonly _nnfb: NonNullableFormBuilder,
    public equipeService: EquipeService,
    private readonly _programasService: ProgramasService,
    private readonly _valorService: ValorService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _pessoasService: PessoasService,
    private readonly _usuarioService: UsuarioService,
    private readonly _projetosService: ProjetosService
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

        // console.log(' response byId programa : ', response);

        this.programaAtual = response;
        const programaModel = new ProgramaModel(response);

        this.iniciarForm(programaModel);

        this._subscription.add( this._opcoesDropdownService
          .getOpcoesDicsElegiveisPrograma(response.idProjetoPropostoList.join(';'))
          .pipe(
            tap((response: IProjetoPropostoOpcoesDropdown[]) => {
              this.projetosPropostosOpcoes = response;
            })
          ).subscribe());

        this._idProgramaEdicao = programaModel.id;
        this.atualizarBotoes(this.programaAtual);
        this.mostrarBotaoBaixarPrograma = true;
        this.equipeCaptacao = programaModel.equipeCaptacao;
        this.loading = false;
      })
    );

    this._cadastrarPrograma$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this._programasService.gerarBotoesAcaoFormulario({
            deveExibirBotaoSalvar: true,
            deveExibirBotaoSolicitarAutorizacao: false,
            deveExibirBotaoAutuar: false,
          })
        );

        this.loading = false;
      })
    );

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Secretaria)
      .pipe(
        tap(
          (response: IOpcoesDropdown[]) => (this.organizacoesOpcoes = response)
        )
      );

    this._getPessoasOpcoes$ = this._opcoesDropdownService
      .getOpcoesPessoas()
      .pipe(
        tap(
          (response: IOpcoesDropdownResponsavelProponente[]) =>
            (this.pessoasOpcoes = response)
        )
      );

    this._getTiposPapelOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposPapel()
      .pipe(
        tap((response) => {
          this.tiposPapelOpcoes = response;
          const idsPermitidos = [
            TipoPapelEnum.Gerente_de_Projeto,
            // TipoPapelEnum.Redator,
            TipoPapelEnum.Membro_do_Projeto
          ];
          this.tiposPapelOpcoesVisiveis = response.filter((papel) =>
            idsPermitidos.includes(papel.id)
          );
        })
      );

    this._getProjetosPropostosOpcoes$ = this._opcoesDropdownService
      .getOpcoesDicsElegiveisPrograma()
      .pipe(
        tap((response: IProjetoPropostoOpcoesDropdown[]) => {
          this.projetosPropostosOpcoes = response;
        })
      );

    this._getProgramasOpcoes$ = this._opcoesDropdownService
      .getOpcoesProgramas()
      .pipe(
        tap((response: IOpcoesDropdown[]) => (this.programasOpcoes = response))
      );

    // 07/10/2024 - Somente exibir tipos de valor 'Estimado', 'Em captação' e 'Captado'
    this._getTiposValorOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposValor()
      .pipe(
        tap(
          (response: IOpcoesDropdown[]) =>
            (this.tiposValorOpcoes = response.filter(
              (tipoValor) => tipoValor.id <= 3
            ))
        )
      );

    this._getAllOpcoes$ = forkJoin([
      this._getOrganizacoesOpcoes$,
      this._getPessoasOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getProjetosPropostosOpcoes$,
      this._getProgramasOpcoes$,
      this._getTiposValorOpcoes$
    ]);

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
    
  }

  ngAfterViewInit(): void {
    const orgaosController = this.getControl('orgaosEnvolvidosList');
    if (orgaosController) {
      if (orgaosController.hasAsyncValidator(this.todosOrgaosPossuemTipoValidator())) {
        orgaosController.removeAsyncValidators(this.todosOrgaosPossuemTipoValidator());
      }

      orgaosController.addAsyncValidators(this.todosOrgaosPossuemTipoValidator());
      orgaosController.updateValueAndValidity();
    }
  }
  
  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe({
      next: (res) => {
        // É necessário fazer os passos abaixos pois no caso de Cadastrar Programa, o validator assícrono estava sendo
        // criado antes da propriedade organizacoesOpcoes ser preenchida.
        // Isso fazia com que o validator sempre retornava um erro, visto que não conseguia acessar a lista de opções p/
        // fazer as verificações.

        

        this._subscription.add(this._atualizarPrograma$.subscribe());
        this._subscription.add(this._cadastrarPrograma$.subscribe());

         this._pessoasService.buscarTodosAgentesPublicosGoves().subscribe({
          error: (err) =>
            console.error(
              'Erro ao carregar em cache lista de todos agentes públicos ligados ao Governo :',
              err
            ),
        });

        // fixa tipo como valor estimado..
        this.programaForm.patchValue({
          valor: {
            tipo: TipoValorEnum.Estimado,
          },
        });
      }
    }));

    

   
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._programasService.idPrograma$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.programaForm.get(controlName) as AbstractControl<any, any>;
  }

  public get idProjetoPropostoList(): FormControl<Array<number>> {
    return this.programaForm.get('idProjetoPropostoList') as FormControl<
      Array<number>
    >;
  }

  public get percentualCustosAdministrativos(): FormControl<number> {
    return this.programaForm.get(
      'percentualCustoAdministrativo'
    ) as FormControl<number>;
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public idProjetoPropostoNgSelectChangeEvent(
    event: IProjetoPropostoOpcoesDropdown
  ): void {
    if (event.idPrograma) {
      const nomeProjeto = event.nome;

      const nomePrograma = this.programasOpcoes.find(
        (programaOpcao) => programaOpcao.id === event.idPrograma
      )?.nome;
      this.dispararModalAtencao(nomeProjeto, nomePrograma!);
    }

    if (!event.parecerGEOCEnviado) {
      const nomeProjeto = event.nome;
      const nomePrograma = this.programasOpcoes.find(
        (programaOpcao) => programaOpcao.id === event.idPrograma
      )?.nome;
      this.dispararModalAtencaoParecerGEOC(nomeProjeto, nomePrograma!);
      return;
    }

    const orgaosEnvolvidosList = this.programaForm.controls['orgaosEnvolvidosList'];

    orgaosEnvolvidosList.patchValue([
      ...orgaosEnvolvidosList.value,
      ...(this.orgaosSelecionados.some(orgaoOpt => orgaoOpt.id === event.idOrganizacao) 
          ? [] 
          : [event.idOrganizacao])
    ])

    this.idProjetoPropostoList.patchValue([
      ...this.idProjetoPropostoList.value,
      event.id,
    ]);

    setTimeout(() => (this.idProjetoProposto = null), 0);
  }

  public percentualCustoAdministrativoChangeEvent(event: any): void {
    const valorTotalCalculadoProgramaFormGroupControl = this.programaForm.get(
      'valorCalculadoTotal'
    ) as FormControl<number | null>;

    const listaIds = this.idProjetoPropostoList.value ?? [];

    var valorTotalCalculadoPrograma = 0;

    const valorPercentual = Number(
      event.target.value.replace(/\./g, '').replace(',', '.')
    );

    const somatorioValorProjetosPropostos = listaIds
      .map((id) => this.getProjetoPropostoOpcao(id).valorEstimado ?? 0)
      .reduce((acc, valor) => acc + valor, 0);

    if (valorPercentual > 0) {
      valorTotalCalculadoPrograma =
        somatorioValorProjetosPropostos * (1 + valorPercentual / 100);
    } else if (valorPercentual === 0) {
      valorTotalCalculadoPrograma = somatorioValorProjetosPropostos;
    }

    if (this.statusProgramaAtual === StatusPrograma.EDICAO) {
      valorTotalCalculadoProgramaFormGroupControl.patchValue(
        valorTotalCalculadoPrograma ? valorTotalCalculadoPrograma : 0
      );
    }
  }

  public filtrarOpcoesProjetosPropostos(
    projetosPropostosOpcoes: Array<IProjetoPropostoOpcoesDropdown>
  ): Array<IProjetoPropostoOpcoesDropdown> {
    const projetosSelecionados = this.idProjetoPropostoList.value;

    return projetosPropostosOpcoes.filter(
      (projeto) => {
        // Condições
        const projetoNaoFoiSelecionado = !projetosSelecionados.includes(projeto.id);

        if (projeto.idPrograma) {
          // Se o projeto estiver vinculado a algum Programa
          // const programaAQualOProjetoEstaVinculado = this.pro
        }

        // Se projeto/DIC não está vinculado a nenhum Programa
        return projetoNaoFoiSelecionado;
      }
    );
  }

  public getProjetoPropostoOpcao(
    idProjetoProposto: number
  ): IProjetoPropostoOpcoesDropdown {
    return (
      this.projetosPropostosOpcoes.find(
        (projetoPropostoOpcao) => projetoPropostoOpcao.id === idProjetoProposto
      ) || {
        id: 0,
        nome: '',
        valorEstimado: 0,
        idPrograma: null,
        parecerGEOCEnviado: false,
        idOrganizacao: undefined
      }
    );
  }

  public removerProjetoPropostoDoPrograma(index: number): void {
    this.idProjetoPropostoList.value.splice(index, 1);

    this.idProjetoPropostoList.patchValue(this.idProjetoPropostoList.value);
  }

  private iniciarForm(programaModel?: ProgramaFormModel): void {
    // Atualiza os órgãos locais com seus respectivos papeis ao carregar o Programa
    if (programaModel && programaModel.orgaosEnvolvidosList) {
      programaModel.orgaosEnvolvidosList.forEach((orgao) => {
        const objOrgao = this.organizacoesOpcoes.find((org) => org.id === orgao.id);
        if (objOrgao) objOrgao.papel = orgao.papel;
      });
    }

    this.statusProgramaAtual = programaModel?.statusPrograma ?? StatusPrograma.EDICAO;

    const deveExibirRedatorNaListaDaEquipe: boolean = false;

    this.programaForm = this._nnfb.group({
      sigla: this._nnfb.control(programaModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(programaModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      orgaosEnvolvidosList: this._nnfb.control(
        programaModel?.orgaosEnvolvidosList ? programaModel.orgaosEnvolvidosList.map((org) => org.id) : [],
        [Validators.required, Validators.minLength(1)], [this.todosOrgaosPossuemTipoValidator()]
      ),
      equipeCaptacao: this.equipeService.construirEquipeFormArray(
        programaModel?.equipeCaptacao,
        deveExibirRedatorNaListaDaEquipe,
      ),
      idProjetoPropostoList: this._nnfb.control(
        programaModel?.idProjetoPropostoList ?? [],
        [Validators.required, Validators.minLength(1)],
      ),
      valor: this._valorService.construirValorFormGroup(programaModel?.valor),
      percentualCustoAdministrativo: this._nnfb.control(
        programaModel?.percentualCustoAdministrativo ?? 0
      ),
      valorCalculadoTotal: this._nnfb.control(
        programaModel?.valorCalculadoTotal ?? 0
      ),
      nomeagente: this._nnfb.control(programaModel?.nomeagente ?? null),
    });

    this.programaFormValueChanges();
    this.programaForm.updateValueAndValidity();
  }

  private programaFormValueChanges(): void {
    const valorFormGroupQuantiaFormControl = this.programaForm.get(
      'valor.quantia'
    ) as FormControl<number | null>;

    const percentualCustoAdministrativoFormGroupControl = this.programaForm.get(
      'percentualCustoAdministrativo'
    ) as FormControl<number | null>;

    const valorTotalCalculadoProgramaFormGroupControl = this.programaForm.get(
      'valorCalculadoTotal'
    ) as FormControl<number | null>;

    // const moedaFormControl = this.programaForm.get('valor.moeda') as FormControl<
    //   string | null
    // >;
    // moedaFormControl.disable();
    // const tipoFormControl = this.programaForm.get('valor.tipo') as FormControl<
    //   number | null
    // >;
    // tipoFormControl.patchValue(TipoValorEnum.Estimado);
    // tipoFormControl.disable();

    const valorEstimadoFormControl = this.programaForm.get('valor.quantia') as FormControl<number | null>;
    if (valorEstimadoFormControl) valorEstimadoFormControl.disable();

    this.idProjetoPropostoList.valueChanges.subscribe(
      (idProjetoPropostoListValue) => {
        const somatorioValorProjetosPropostos = idProjetoPropostoListValue
          .map(
            (idProjetoProposto) =>
              this.getProjetoPropostoOpcao(idProjetoProposto).valorEstimado
          )
          .reduce((acc, valorEstimado) => acc + (valorEstimado ?? 0), 0);

        var valorTotalCalculadoPrograma = 0;

        if ((percentualCustoAdministrativoFormGroupControl?.value ?? 0) > 0) {
          const percentual =
            percentualCustoAdministrativoFormGroupControl.value ?? 0;
          valorTotalCalculadoPrograma =
            somatorioValorProjetosPropostos * (1 + percentual / 100);
        } else if ((percentualCustoAdministrativoFormGroupControl?.value ?? 0) === 0) {
          valorTotalCalculadoPrograma = somatorioValorProjetosPropostos;
        }

        if (this.statusProgramaAtual === StatusPrograma.EDICAO) {
          valorFormGroupQuantiaFormControl.patchValue(
            somatorioValorProjetosPropostos
              ? somatorioValorProjetosPropostos
              : null
          );

          valorTotalCalculadoProgramaFormGroupControl.patchValue(
            valorTotalCalculadoPrograma ? valorTotalCalculadoPrograma : 0
          );
        }
      }
    );
  }

  private dispararModalAtencao(
    nomeProjeto: string,
    nomePrograma: string
  ): void {
    const modalRef = this._ngbModalService.open(
      ProgramaProjetoPropostoVinculadoWarningModalComponent,
      {
        centered: true,
      }
    );

    modalRef.componentInstance.nomeProjeto = nomeProjeto;
    modalRef.componentInstance.nomePrograma = nomePrograma;
  }

  private dispararModalAtencaoParecerGEOC(
    nomeProjeto: string,
    nomePrograma: string
  ): void {
    const modalRef = this._ngbModalService.open(
      ProgramaProjetoPropostoParecerGeocEnviadoWarningModalComponent,
      {
        centered: true,
      }
    );

    modalRef.componentInstance.nomeProjeto = nomeProjeto;
    modalRef.componentInstance.nomePrograma = nomePrograma;
  }

  private executarAcaoBreadcrumb(acao: TBotaoAcao): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Cancelar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Programas
        );
        break;

      case BreadcrumbAcoesEnum.SolicitarAutorizacao:
        this.dispararModalConfirmarSolicitarAutorizacao();
        break;

      case BreadcrumbAcoesEnum.Autuar:
        this.dispararModalConfirmarAutuacao();
        break;

      case BreadcrumbAcoesEnum.Salvar:
        this.submitProgramaForm(this.programaForm);
        break;

      case BreadcrumbAcoesEnum.Exportar:
        this.exportarPrograma();
        break;
    }
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

    const payload = new ProgramaFormModel(form.getRawValue() as IProgramaForm);

    const idsOrgaosSelecionados = (payload.orgaosEnvolvidosList as unknown as Array<number>);
    const orgaosSelecionados = this.organizacoesOpcoes.filter((org) => idsOrgaosSelecionados.includes(org.id));
    payload.orgaosEnvolvidosList = orgaosSelecionados.map((org) => ({
      id: org.id,
      idPrograma: this.programaAtual?.id,
      papel: org.papel || PapelOrgaoPrograma.EXECUTOR,
    }));

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
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
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
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
    );
  }

  public buscarAgentesPorTermo(): IOpcoesDropdownResponsavelProponente[] {
    this.isLoadingPessoasFiltroTermo = true;

    const termo = this.programaForm.get('nomeagente')?.value ?? '';

    if (termo.length < 3) {
      this._toastService.showToast(
        'info',
        'Informe pelo menos um nome com no mínimo 3 caracteres.'
      );
      this.pessoasOpcoesGoves = [];
      this.isLoadingPessoasFiltroTermo = false;
      return this.pessoasOpcoesGoves;
    }

    this._pessoasService.buscarAgentesPorTermo(termo).subscribe({
      next: (lista) => {
        this.pessoasOpcoesGoves = lista;

        // this.pessoasOpcoesGoves = this.pessoasOpcoesGoves.filter( pessoa =>
        //   !this.equipeCaptacao.some( equipeCaptacao => equipeCaptacao.idStatus === TipoStatusEnum.Inativo && equipeCaptacao.subPessoa === pessoa.agentePublicoSub )
        // );

        if (this.pessoasOpcoesGoves.length === 0) {
          this._toastService.showToast('info', 'Nenhum agente encontrado.', [
            'Verifique se já faz parte da equipe.',
          ]);
        }

        this.isLoadingPessoasFiltroTermo = false;
        this.exibirLista = true;

        this.programaForm.get('nomeagente')?.reset();
      },
      error: () => {
        this.pessoasOpcoesGoves = [];
        this.isLoadingPessoasFiltroTermo = false;
      },
    });

    return this.pessoasOpcoesGoves;
  }

  public async idMembroNgSelectChangeEvent(
    event: IOpcoesDropdownResponsavelProponente
  ): Promise<void> {
    const jaExiste =
      this.equipeService.equipeFormArray.value.some(
        (membro) =>
          membro.subPessoa === event.agentePublicoSub &&
          membro.idStatus === TipoStatusEnum.Ativo
      ) ||
      this._usuarioService.usuarioPerfil.subNovo === event.agentePublicoSub;

    if (jaExiste) {
      this._toastService.showToast('info', 'Pessoa já incluso na equipe');
    } else {
      this.equipeService.idMembroNgSelectValue$.next(event);
    }

    this.exibirLista = false;
  }

  private atualizarBotoes(programa: IPrograma) {
    const deveExibirBotaoSalvar = (programa.statusPrograma && programa.statusPrograma === StatusPrograma.EDICAO) || !programa.statusPrograma;
    // Botão de Salvar Rascunho só aparece se o Programa é editável
    
    const deveExibirBotaoAutuar = programa.statusPrograma === StatusPrograma.ASSINADO;
    // Botão de Autuar deve aparecer somente se o Programa já foi Assinado

    const deveExibirBotaoSolicitarAutorizacao = [StatusPrograma.AGUARDANDO_ASSINATURAS].includes(programa.statusPrograma) 
                                              || ![StatusPrograma.ASSINADO, StatusPrograma.AUTUADO, StatusPrograma.RECUSADO].includes(programa.statusPrograma);
    // Botão de Solicitar Autorizações não deve aparecer se o Programa já foi Assinado, Autuado ou Recusado

    this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
      this._programasService.gerarBotoesAcaoFormulario({
        deveExibirBotaoSalvar,
        deveExibirBotaoSolicitarAutorizacao,
        deveExibirBotaoAutuar,
      })
    );
  }

  public exportarPrograma() {
    this.loading = true;

    const $requestStatus = this._programasService.exportById(
      this._programasService.idPrograma$.getValue(),
      this.getControl('titulo').value
    );

    $requestStatus.subscribe((newStatus) => {
      this.loading = false;
    });
  }

  private dispararModalConfirmarSolicitarAutorizacao() {
    const modalRef = this._ngbModalService.open(ConfirmationModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.config = {
      titulo: 'Confirmação',
      headerCustomClass: 'bg-success-subtle',
      textoPrincipal: 'Essa ação enviará email aos gestores para autorização do programa.',
    };

    modalRef.result.then(
      (resolve) => {},
      (result) => {
        if (result === 'confirmar') {
          this.loading = true;

          this._programasService
            .solicitarAutorizacoesPrograma(this._idProgramaEdicao)
            .subscribe({
              next: () => {
                this.loading = false;

                this._programasService.adicionarProgramaAguardandoEdocs(this._idProgramaEdicao);
                this._toastService.showToast(
                  'warning',
                  'As Autorizações foram solicitadas!'
                );

                this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
                // Redireciona pra lista de Programas
              },
              error: (err) => {
                console.error(
                  'Ocorreu um erro ao tentar solicitar as Autorizações do Programa.\n',
                  err
                );
                this.loading = false;

                this._toastService.showToast(
                  'error',
                  'Ocorreu um erro ao tentar solicitar as Autorizações do Programa'
                );
              },
            });
        }
      }
    );
  }

  private dispararModalConfirmarAutuacao() {
    const modalRef = this._ngbModalService.open(ConfirmationModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.config = {
      titulo: 'Confirmação',
      headerCustomClass: 'bg-success-subtle',
      textoPrincipal:
        'Essa ação irá Autuar o Programa em seu estado atual. Os dados do Programa jamais poderão ser alterados a partir deste ponto.',
      textoSecundario: 'Tem certeza que deseja continuar?',
      textoPrincipalCustomClass: 'fw-bold',
    };

    modalRef.result.then(
      (resolve) => {},
      (result) => {
        if (result === 'confirmar') {
          this.loading = true;

          this._programasService
            .autuarPrograma(this._idProgramaEdicao)
            .subscribe({
              next: (res) => {
                this._programasService.adicionarProgramaAguardandoEdocs(this._idProgramaEdicao);
                this.loading = false;

                this._toastService.showToast(
                  'warning',
                  'A Autuação do Programa foi solicitada!'
                );

                this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
                // Redireciona pra lista de Programas
              },
              error: (err) => {
                console.error(
                  'Ocorreu um erro ao tentar Autuar o Programa!.\n',
                  err
                );
                this.loading = false;

                this._toastService.showToast(
                  'error',
                  'Ocorreu um erro ao tentar Autuar o Programa!'
                );
              },
            });
        }
      }
    );
  }

  handleSelecaoOrgaoRemovido(orgaoRemovido: IPapeisOrgaoProgramaDropdownOpcoes) {
    const objOrgao = this.organizacoesOpcoes.find((org) => org.id === orgaoRemovido.id);
    if (objOrgao) delete objOrgao.papel;

    const orgaosControl = this.getControl('orgaosEnvolvidosList');
    if (orgaosControl) {
      const listaOrgaosSelecionados: Array<number> = orgaosControl.value;
      const listaOrgaosAtualizados = listaOrgaosSelecionados.filter((id) => id !== orgaoRemovido.id);
      orgaosControl.setValue(listaOrgaosAtualizados);
      orgaosControl.updateValueAndValidity();
    }
  }

  handlePapeisOrgaosSelecionados(orgaosSelecionadosAtualizados: Array<IPapeisOrgaoProgramaDropdownOpcoes>) {
    orgaosSelecionadosAtualizados.forEach((orgao) => {
      const objOrgao = this.organizacoesOpcoes.find((el) => el.id === orgao.id);
      if (objOrgao) objOrgao.papel = orgao.papel;
    });

    this.getControl('orgaosEnvolvidosList').updateValueAndValidity();
  }

  /* Async Validator */
  todosOrgaosPossuemTipoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of(control.value as Array<number>)
        .pipe(
          map(idsOrgaosSelecionados => {
            const organizacoesOpcoes = this.organizacoesOpcoes;

            if (organizacoesOpcoes.length > 0) {
              const opcoesSelecionadas = organizacoesOpcoes.filter((org) => idsOrgaosSelecionados.includes(org.id));
              const algumOrgaoGestor = opcoesSelecionadas.some((org) => org.papel === PapelOrgaoPrograma.GESTOR);
              const algumOrgaoSemPapel = opcoesSelecionadas.some((org) => !org.papel || org.papel === null);
  
              if (!algumOrgaoGestor) {
                return { precisaAoMenosUmOrgaoGestor: true };
              }
              if (algumOrgaoSemPapel) {
                return { orgaoPrecisaTerUmPapel: true };
              }
            }

            return null;
          }),
        );
    }
  }
}
