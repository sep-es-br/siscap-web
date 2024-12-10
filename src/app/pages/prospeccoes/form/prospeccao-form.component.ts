import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  concat,
  distinct,
  finalize,
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  ProspeccaoFormModel,
  ProspeccaoInteressadoModel,
  ProspeccaoModel,
} from '../../../core/models/prospeccao.model';

import { ProspeccaoInteressadoFormType } from '../../../core/types/form/interessado-form.type';

import {
  IProspeccao,
  IProspeccaoForm,
} from '../../../core/interfaces/prospeccao.interface';
import {
  IOpcoesDropdown,
  IProspeccaoInteressadoOpcoesDropdown,
} from '../../../core/interfaces/opcoes-dropdown.interface';

import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';

@Component({
  selector: 'siscap-prospeccao-form',
  standalone: false,
  templateUrl: './prospeccao-form.component.html',
  styleUrl: './prospeccao-form.component.scss',
})
export class ProspeccaoFormComponent implements OnInit, OnDestroy {
  private readonly _atualizarProspeccao$: Observable<IProspeccao>;
  private readonly _cadastrarProspeccao$: Observable<number>;

  private readonly _getCartasConsultaOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getOrganizacaoProspectoraOpcoes$: Observable<
    IOpcoesDropdown[]
  >;
  private readonly _getOrganizacaoProspectadaOpcoes$: Observable<
    IOpcoesDropdown[]
  >;
  private readonly _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getInteressadosOpcoes$: Observable<
    IProspeccaoInteressadoOpcoesDropdown[]
  >;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private readonly _subscription: Subscription = new Subscription();

  private _idProspeccaoEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public prospeccaoForm: FormGroup = new FormGroup({});

  public isClonarProspeccao: boolean = false;

  public cartasConsultaOpcoes: IOpcoesDropdown[] = [];
  public organizacaoProspectoraOpcoes: IOpcoesDropdown[] = [];
  public organizacaoProspectoraOpcoesFiltradas: IOpcoesDropdown[] = [];
  public organizacaoProspectadaOpcoes: IOpcoesDropdown[] = [];
  public organizacaoProspectadaOpcoesFiltradas: IOpcoesDropdown[] = [];
  public pessoasOpcoes: IOpcoesDropdown[] = [];
  public interessadosOpcoes: IProspeccaoInteressadoOpcoesDropdown[] = [];
  public interessadosOpcoesFiltradas: IProspeccaoInteressadoOpcoesDropdown[] =
    [];

  public idInteressado: number | null = null;

  constructor(
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _router: Router,
    private readonly _prospeccoesService: ProspeccoesService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _toastService: ToastService
  ) {
    const [editar$, criar$] = partition(
      this._prospeccoesService.idProspeccao$,
      (idProspeccao: number) => idProspeccao > 0
    );

    this._atualizarProspeccao$ = editar$.pipe(
      switchMap((idProspeccao: number) =>
        this._prospeccoesService.getById(idProspeccao)
      ),
      map<IProspeccao, ProspeccaoModel>(
        (response: IProspeccao) => new ProspeccaoModel(response)
      ),
      tap((prospeccaoModel: ProspeccaoModel) => {
        this.iniciarForm(prospeccaoModel);

        this._idProspeccaoEdicao = prospeccaoModel.id;

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarProspeccao$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.loading = false;
      })
    );

    this._getCartasConsultaOpcoes$ = this._opcoesDropdownService
      .getOpcoesCartasConsulta()
      .pipe(tap((response) => (this.cartasConsultaOpcoes = response)));

    this._getOrganizacaoProspectoraOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Secretaria)
      .pipe(
        tap(
          (response) =>
            (this.organizacaoProspectoraOpcoesFiltradas =
              this.organizacaoProspectoraOpcoes =
                response)
        )
      );

    this._getOrganizacaoProspectadaOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Instituicao_Financeira)
      .pipe(
        tap(
          (response) =>
            (this.organizacaoProspectadaOpcoesFiltradas =
              this.organizacaoProspectadaOpcoes =
                response)
        )
      );

    this._getPessoasOpcoes$ = this._opcoesDropdownService
      .getOpcoesPessoas()
      .pipe(tap((response) => (this.pessoasOpcoes = response)));

    this._getInteressadosOpcoes$ = this._opcoesDropdownService
      .getOpcoesInteressados()
      .pipe(
        tap(
          (response) =>
            (this.interessadosOpcoesFiltradas = this.interessadosOpcoes =
              response)
        )
      );

    this._getAllOpcoes$ = concat(
      this._getCartasConsultaOpcoes$,
      this._getOrganizacaoProspectoraOpcoes$,
      this._getOrganizacaoProspectadaOpcoes$,
      this._getPessoasOpcoes$,
      this._getInteressadosOpcoes$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

    this._subscription.add(this._atualizarProspeccao$.subscribe());
    this._subscription.add(this._cadastrarProspeccao$.subscribe());
  }

  public get interessadosList(): FormArray<
    FormGroup<ProspeccaoInteressadoFormType>
  > {
    return this.getControl('interessadosList') as FormArray<
      FormGroup<ProspeccaoInteressadoFormType>
    >;
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.prospeccaoForm.get(controlName) as AbstractControl<any, any>;
  }

  public idInteressadoNgSelectChangeEvent(event: number): void {
    const interessadoOpcao = this.interessadosOpcoes.find(
      (interessadoOpcao) => interessadoOpcao.id === event
    );

    this.interessadosList.push(
      this.construirInteressadoFormGroupInteressadoNgSelect(interessadoOpcao!)
    );

    setTimeout(() => (this.idInteressado = null), 0);
  }

  public checarIsDisabledInteressadoOpcao(idInteressado: number): boolean {
    return this.interessadosList.value.some(
      (interessadoValue) => interessadoValue.idInteressado == idInteressado
    );
  }

  public getInteressadoNome(idInteressado?: number): string {
    return (
      this.interessadosOpcoes.find(
        (interessadoOpcao) => interessadoOpcao.id === idInteressado
      )?.nome ?? ''
    );
  }

  public removerInteressadoDaProspeccao(index: number): void {
    this.interessadosList.removeAt(index);
  }

  private iniciarForm(prospeccaoFormModel?: ProspeccaoFormModel): void {
    this.prospeccaoForm = this._nnfb.group({
      idCartaConsulta: this._nnfb.control(
        prospeccaoFormModel?.idCartaConsulta ?? null,
        {
          validators: Validators.required,
        }
      ),
      idOrganizacaoProspectora: this._nnfb.control(
        prospeccaoFormModel?.idOrganizacaoProspectora ?? null,
        {
          validators: Validators.required,
        }
      ),
      idPessoaProspectora: this._nnfb.control(
        prospeccaoFormModel?.idPessoaProspectora ?? null,
        {
          validators: Validators.required,
        }
      ),
      idOrganizacaoProspectada: this._nnfb.control(
        prospeccaoFormModel?.idOrganizacaoProspectada ?? null,
        {
          validators: Validators.required,
        }
      ),
      interessadosList: this.construirInteressadosFormArray(
        prospeccaoFormModel?.interessadosList
      ),
    });

    this.prospeccaoFormValueChanges();
  }

  private construirInteressadosFormArray(
    interessadosList?: Array<ProspeccaoInteressadoModel>
  ): FormArray<FormGroup<ProspeccaoInteressadoFormType>> {
    const interessadosFormArray = this._nnfb.array<
      FormGroup<ProspeccaoInteressadoFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (interessadosList) {
      interessadosList.forEach((interessado) => {
        interessadosFormArray.push(
          this.construirInteressadoFormGroup(interessado)
        );
      });
    }

    return interessadosFormArray;
  }

  private construirInteressadoFormGroup(
    interessado?: ProspeccaoInteressadoModel
  ): FormGroup<ProspeccaoInteressadoFormType> {
    return this._nnfb.group({
      idInteressado: this._nnfb.control(interessado?.idInteressado ?? 0, {
        validators: Validators.required,
      }),
      emailInteressado: this._nnfb.control(
        interessado?.emailInteressado ?? null,
        {
          validators: [Validators.required, Validators.email],
        }
      ),
    });
  }

  private construirInteressadoFormGroupInteressadoNgSelect(
    interessadoOpcao: IProspeccaoInteressadoOpcoesDropdown
  ): FormGroup<ProspeccaoInteressadoFormType> {
    const interessadoFormGroup = this.construirInteressadoFormGroup();
    interessadoFormGroup.patchValue({
      idInteressado: interessadoOpcao.id,
      emailInteressado: interessadoOpcao.email,
    });
    return interessadoFormGroup;
  }

  private prospeccaoFormValueChanges(): void {
    const idOrganizacaoProspectoraFormControl = this.prospeccaoForm.get(
      'idOrganizacaoProspectora'
    ) as FormControl<number | null>;

    const idOrganizacaoProspectadaFormControl = this.prospeccaoForm.get(
      'idOrganizacaoProspectada'
    ) as FormControl<number | null>;

    idOrganizacaoProspectoraFormControl.valueChanges.subscribe(
      (idOrganizacaoProspectoraValue) => {
        this.organizacaoProspectadaOpcoesFiltradas =
          this.filtrarOrganizacoesOpcoes(
            this.organizacaoProspectadaOpcoes,
            idOrganizacaoProspectoraValue,
            idOrganizacaoProspectadaFormControl.value
          );
      }
    );

    idOrganizacaoProspectadaFormControl.valueChanges
      .pipe(distinct())
      .subscribe((idOrganizacaoProspectadaValue) => {
        this.organizacaoProspectoraOpcoesFiltradas =
          this.filtrarOrganizacoesOpcoes(
            this.organizacaoProspectoraOpcoes,
            idOrganizacaoProspectoraFormControl.value,
            idOrganizacaoProspectadaValue
          );

        this.interessadosOpcoesFiltradas = this.filtrarInteressadosOpcoes(
          idOrganizacaoProspectadaValue
        );

        if (this.isModoEdicao && this.interessadosList.length > 0) {
          this.limparInteressadosList();
        }
      });
  }

  private filtrarOrganizacoesOpcoes(
    opcoesDropdownAlvo: IOpcoesDropdown[],
    idOrganizacaoProspectoraValue: number | null,
    idOrganizacaoProspectadaValue: number | null
  ): IOpcoesDropdown[] {
    return opcoesDropdownAlvo.filter(
      (organizacaoOpcao) =>
        organizacaoOpcao.id !== idOrganizacaoProspectoraValue &&
        organizacaoOpcao.id !== idOrganizacaoProspectadaValue
    );
  }

  private filtrarInteressadosOpcoes(
    idOrganizacaoProspectadaValue: number | null
  ): IProspeccaoInteressadoOpcoesDropdown[] {
    if (!idOrganizacaoProspectadaValue) return this.interessadosOpcoes;

    return this.interessadosOpcoes.filter((interessadoOpcao) =>
      interessadoOpcao.idsOrganizacoesList.includes(
        idOrganizacaoProspectadaValue
      )
    );
  }

  private limparInteressadosList(): void {
    this._toastService.showToast('info', 'Organização prospectada alterada', [
      'Limpando os interessados.',
    ]);

    this.interessadosList.clear();
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
        this.submitProspeccaoForm(this.prospeccaoForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const prospeccaoFormControls = this.prospeccaoForm.controls;

    alterarEstadoControlesFormulario(permitir, prospeccaoFormControls);

    // 10/12/2024 - Correção de bug emergencial
    const idOrganizacaoProspectadaValue =
      prospeccaoFormControls['idOrganizacaoProspectada'].value;

    this.interessadosOpcoesFiltradas = this.filtrarInteressadosOpcoes(
      idOrganizacaoProspectadaValue
    );
  }

  private cancelar(): void {
    this._router.navigate(['main', 'prospeccao']);
  }

  private submitProspeccaoForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new ProspeccaoFormModel(form.value as IProspeccaoForm);

    const requisicao = this._idProspeccaoEdicao
      ? this.atualizarProspeccao(payload)
      : this.cadastrarProspeccao(payload);

    requisicao.subscribe();
  }

  private cadastrarProspeccao(
    payload: ProspeccaoFormModel
  ): Observable<IProspeccao> {
    return this._prospeccoesService.post(payload).pipe(
      tap((response: IProspeccao) => {
        this._toastService.showToast(
          'success',
          'Prospecção cadastrada com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  private atualizarProspeccao(
    payload: ProspeccaoFormModel
  ): Observable<IProspeccao> {
    return this._prospeccoesService.put(this._idProspeccaoEdicao, payload).pipe(
      tap((response: IProspeccao) => {
        this._toastService.showToast(
          'success',
          'Prospecção alterada com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._prospeccoesService.idProspeccao$.next(0);
  }
}
