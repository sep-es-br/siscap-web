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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ProgramaProjetoPropostoVinculadoWarningModalComponent } from '../../../shared/templates/programa-projeto-proposto-vinculado-warning-modal/programa-projeto-proposto-vinculado-warning-modal.component';

import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  ProgramaFormModel,
  ProgramaModel,
} from '../../../core/models/programa.model';

import {
  IPrograma,
  IProgramaForm,
} from '../../../core/interfaces/programa.interface';
import {
  IProjetoPropostoOpcoesDropdown,
  IOpcoesDropdown,
} from '../../../core/interfaces/opcoes-dropdown.interface';
import { IMoeda } from '../../../core/interfaces/moeda.interface';

import { MoedaHelper } from '../../../core/helpers/moeda.helper';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';

@Component({
  selector: 'siscap-programa-form',
  standalone: false,
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.scss',
})
export class ProgramaFormComponent implements OnInit, OnDestroy {
  private _atualizarPrograma$: Observable<IPrograma>;
  private _cadastrarPrograma$: Observable<number>;

  private _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getTiposPapelOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getProjetosPropostosOpcoes$: Observable<
    IProjetoPropostoOpcoesDropdown[]
  >;
  private _getProgramasOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getTiposValorOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idProgramaEdicao: number = 0;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public programaForm: FormGroup = new FormGroup({});

  public organizacoesOpcoes: IOpcoesDropdown[] = [];
  public pessoasOpcoes: IOpcoesDropdown[] = [];
  public tiposPapelOpcoes: IOpcoesDropdown[] = [];
  public projetosPropostosOpcoes: IProjetoPropostoOpcoesDropdown[] = [];
  public programasOpcoes: IOpcoesDropdown[] = [];
  public tiposValorOpcoes: IOpcoesDropdown[] = [];

  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();

  public idMembroEquipeCaptacao: number | null = null;
  public idProjetoProposto: number | null = null;

  constructor(
    private readonly _router: Router,
    private readonly _nnfb: NonNullableFormBuilder,
    public equipeService: EquipeService,
    private readonly _programasService: ProgramasService,
    private readonly _valorService: ValorService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService
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

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarPrograma$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

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
        tap((response: IOpcoesDropdown[]) => (this.pessoasOpcoes = response))
      );

    this._getTiposPapelOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposPapel()
      .pipe(
        tap((response: IOpcoesDropdown[]) => (this.tiposPapelOpcoes = response))
      );

    this._getProjetosPropostosOpcoes$ = this._opcoesDropdownService
      .getOpcoesProjetosPropostos()
      .pipe(
        tap(
          (response: IProjetoPropostoOpcoesDropdown[]) =>
            (this.projetosPropostosOpcoes = response)
        )
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
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

    this._subscription.add(this._atualizarPrograma$.subscribe());
    this._subscription.add(this._cadastrarPrograma$.subscribe());
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.programaForm.get(controlName) as AbstractControl<any, any>;
  }

  public get idProjetoPropostoList(): FormControl<Array<number>> {
    return this.programaForm.get('idProjetoPropostoList') as FormControl<
      Array<number>
    >;
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public idMembroNgSelectChangeEvent(event: number): void {
    this.equipeService.idMembroNgSelectValue$.next(event);

    setTimeout(() => (this.idMembroEquipeCaptacao = null), 0);
  }

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

    this.idProjetoPropostoList.patchValue([
      ...this.idProjetoPropostoList.value,
      event.id,
    ]);

    setTimeout(() => (this.idProjetoProposto = null), 0);
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
    return this.projetosPropostosOpcoes.find(
      (projetoPropostoOpcao) => projetoPropostoOpcao.id === idProjetoProposto
    )!;
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
        programaModel?.equipeCaptacao
      ),
      idProjetoPropostoList: this._nnfb.control(
        programaModel?.idProjetoPropostoList ?? [],
        [Validators.required, Validators.minLength(1)]
      ),
      valor: this._valorService.construirValorFormGroup(programaModel?.valor),
    });

    this.programaFormValueChanges();
  }

  private programaFormValueChanges(): void {
    const valorFormGroupQuantiaFormControl = this.programaForm.get(
      'valor.quantia'
    ) as FormControl<number | null>;

    this.idProjetoPropostoList.valueChanges.subscribe(
      (idProjetoPropostoListValue) => {
        const somatorioValorProjetosPropostos = idProjetoPropostoListValue
          .map(
            (idProjetoProposto) =>
              this.getProjetoPropostoOpcao(idProjetoProposto).valorEstimado
          )
          .reduce((acc, valorEstimado) => acc + (valorEstimado ?? 0), 0);

        if (this.isModoEdicao) {
          valorFormGroupQuantiaFormControl.patchValue(
            somatorioValorProjetosPropostos
              ? somatorioValorProjetosPropostos
              : null
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

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this.trocarModo(true);
        break;

      case 'cancelar':
        this.cancelar();
        break;

      case 'salvar':
        this.submitProgramaForm(this.programaForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const programaFormControls = this.programaForm.controls;

    alterarEstadoControlesFormulario(permitir, programaFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'programas']);
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
      finalize(() => this.cancelar())
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
      finalize(() => this.cancelar())
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._programasService.idPrograma$.next(0);
  }
}
