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
  Observable,
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
} from '../../../core/interfaces/programa.interface';
import {
  IProjetoPropostoOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownResponsavelProponente,
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
import { PreventActionModalComponent } from '../../../shared/templates/prevent-action-modal/prevent-action-modal.component';
import { ConfirmationModalComponent } from '../../../shared/templates/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'siscap-programa-form',
  standalone: false,
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.scss',
})
export class ProgramaFormComponent implements OnInit, OnDestroy {
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
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idProgramaEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public programaForm: FormGroup = new FormGroup({});

  public organizacoesOpcoes: IOpcoesDropdown[] = [];
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

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  public mostrarBotaoBaixarPrograma: boolean = false;

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
    private readonly _usuarioService: UsuarioService
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

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this._programasService.gerarBotoesAcaoFormulario({
            isModoEdicao: true,
          })
        );

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
            isModoEdicao: false,
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
          const idsPermitidos = [1, 5];
          this.tiposPapelOpcoesVisiveis = response.filter((papel) =>
            idsPermitidos.includes(papel.id)
          );
        })
      );

    this._getProjetosPropostosOpcoes$ = this._opcoesDropdownService
      .getOpcoesProjetosPropostos()
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

    this._getAllOpcoes$ = concat(
      this._getOrganizacoesOpcoes$,
      this._getPessoasOpcoes$,
      this._getTiposPapelOpcoes$,
      this._getProjetosPropostosOpcoes$,
      this._getProgramasOpcoes$,
      this._getTiposValorOpcoes$
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

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
    }

    if (this.isModoEdicao) {
      valorTotalCalculadoProgramaFormGroupControl.patchValue(
        valorTotalCalculadoPrograma ? valorTotalCalculadoPrograma : 0
      );
    }
  }

  public filtrarProjetosPropostosOpcoes(
    projetosPropostosOpcoes: IProjetoPropostoOpcoesDropdown[]
  ): IProjetoPropostoOpcoesDropdown[] {
    return projetosPropostosOpcoes.filter(
      (projetoProposto) =>
        !this.idProjetoPropostoList.value.includes(projetoProposto.id)
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
      }
    );
  }

  public removerProjetoPropostoDoPrograma(index: number): void {
    this.idProjetoPropostoList.value.splice(index, 1);

    this.idProjetoPropostoList.patchValue(this.idProjetoPropostoList.value);
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
        [Validators.required, Validators.minLength(1)]
      ),
      equipeCaptacao: this.equipeService.construirEquipeFormArray(
        programaModel?.equipeCaptacao,
        false
      ),
      idProjetoPropostoList: this._nnfb.control(
        programaModel?.idProjetoPropostoList ?? [],
        [Validators.required, Validators.minLength(1)]
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
        }

        if (this.isModoEdicao) {
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

    const payload = new ProgramaFormModel(form.value as IProgramaForm);

    //console.log('payload -> ', payload)

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

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._programasService.idPrograma$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
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

  public async exportarPrograma() {
    this._programasService.exportById(
      this._programasService.idPrograma$.getValue(),
      this.getControl('titulo').value
    );
  }

  private dispararModalConfirmarSolicitarAutorizacao() {
    const modalRef = this._ngbModalService.open(ConfirmationModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo =
      'Essa ação irá solicitar as Assinaturas Confirmatórias aos gestores do Programa.';

    modalRef.result.then(
      (resolve) => {},
      (result) => {
        if (result === 'confirmar') {
          this._programasService
            .solicitarAutorizacoesPrograma(this._idProgramaEdicao)
            .subscribe({
              next: (res) => {
                // Falta testar a resposta da API
                console.log('res: ', res);
              },
              error: (err) => {},
            });
        } //  else if (result === 'cancelar') {}
      }
    );
  }
}
