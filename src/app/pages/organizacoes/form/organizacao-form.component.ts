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

import { OrganizacoesService } from '../../../core/services/organizacoes/organizacoes.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  OrganizacaoFormModel,
  OrganizacaoModel,
} from '../../../core/models/organizacao.model';

import {
  IOrganizacao,
  IOrganizacaoForm,
} from '../../../core/interfaces/organizacao.interface';
import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import {
  alterarEstadoControlesFormulario,
  converterArrayBufferEmImgSrc,
} from '../../../core/utils/functions';

@Component({
  selector: 'siscap-organizacao-form',
  standalone: false,
  templateUrl: './organizacao-form.component.html',
  styleUrl: './organizacao-form.component.scss',
})
export class OrganizacaoFormComponent implements OnInit, OnDestroy {
  private _atualizarOrganizacao$: Observable<IOrganizacao>;
  private _cadastrarOrganizacao$: Observable<number>;

  private _getTiposOrganizacaoOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getPaisesOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getPessoasOpcoes$: Observable<IOpcoesDropdown[]>;
  private _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private _idOrganizacaoEdicao: number = 0;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public organizacaoForm: FormGroup = new FormGroup({});

  public tiposOrganizacaoOpcoes: Array<IOpcoesDropdown> = [];
  public organizacoesOpcoes: Array<IOpcoesDropdown> = [];
  public paisesOpcoes: Array<IOpcoesDropdown> = [];
  public estadosOpcoes: Array<IOpcoesDropdown> = [];
  public cidadesOpcoes: Array<IOpcoesDropdown> = [];
  public pessoasOpcoes: Array<IOpcoesDropdown> = [];

  public srcImagemOrganizacao: string = '';
  public arquivoImagemOrganizacao: File | undefined;

  constructor(
    private _nnfb: NonNullableFormBuilder,
    private _router: Router,
    private _organizacoesService: OrganizacoesService,
    private _opcoesDropdownService: OpcoesDropdownService,
    private _breadcrumbService: BreadcrumbService,
    private _toastService: ToastService
  ) {
    const [editar$, criar$] = partition(
      this._organizacoesService.idOrganizacao$,
      (idOrganizacao: number) => idOrganizacao > 0
    );

    this._atualizarOrganizacao$ = editar$.pipe(
      switchMap((idOrganizacao: number) =>
        this._organizacoesService.getById(idOrganizacao)
      ),
      tap((response: IOrganizacao) => {
        const organizacaoModel = new OrganizacaoModel(response);

        this.iniciarForm(organizacaoModel);

        this._idOrganizacaoEdicao = organizacaoModel.id;

        this.srcImagemOrganizacao = converterArrayBufferEmImgSrc(
          organizacaoModel.imagemPerfil
        );

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarOrganizacao$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.loading = false;
      })
    );

    this._getTiposOrganizacaoOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposOrganizacao()
      .pipe(tap((response) => (this.tiposOrganizacaoOpcoes = response)));

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
      .pipe(
        tap((response) => {
          this.organizacoesOpcoes = response;
        })
      );

    this._getPaisesOpcoes$ = this._opcoesDropdownService.getOpcoesPaises().pipe(
      tap((response) => {
        this.paisesOpcoes = response;
      })
    );

    this._getPessoasOpcoes$ = this._opcoesDropdownService
      .getOpcoesPessoas()
      .pipe(
        tap((response) => {
          this.pessoasOpcoes = response;
        })
      );

    this._getAllOpcoes$ = concat(
      this._getTiposOrganizacaoOpcoes$,
      this._getOrganizacoesOpcoes$,
      this._getPaisesOpcoes$,
      this._getPessoasOpcoes$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());

    this._subscription.add(this._atualizarOrganizacao$.subscribe());
    this._subscription.add(this._cadastrarOrganizacao$.subscribe());
  }

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.organizacaoForm.get(controlName) as AbstractControl<any, any>;
  }

  public imgCropEvent(event: any): void {
    this.arquivoImagemOrganizacao = event[0];
  }

  private iniciarForm(organizacaoFormModel?: OrganizacaoFormModel): void {
    this.organizacaoForm = this._nnfb.group({
      nome: this._nnfb.control(organizacaoFormModel?.nome ?? null, {
        validators: Validators.required,
      }),
      abreviatura: this._nnfb.control(
        organizacaoFormModel?.abreviatura ?? null,
        {
          validators: Validators.required,
        }
      ),
      telefone: this._nnfb.control(organizacaoFormModel?.telefone ?? null),
      cnpj: this._nnfb.control(organizacaoFormModel?.cnpj ?? null, {
        validators: [Validators.minLength(14), Validators.maxLength(14)],
      }),
      fax: this._nnfb.control(organizacaoFormModel?.fax ?? null),
      email: this._nnfb.control(organizacaoFormModel?.email ?? null, {
        validators: Validators.email,
      }),
      site: this._nnfb.control(organizacaoFormModel?.site ?? null),
      idOrganizacaoPai: this._nnfb.control(
        organizacaoFormModel?.idOrganizacaoPai ?? null
      ),
      idPessoaResponsavel: this._nnfb.control(
        organizacaoFormModel?.idPessoaResponsavel ?? null,
        { validators: Validators.required }
      ),
      idCidade: this._nnfb.control(organizacaoFormModel?.idCidade ?? null),
      idEstado: this._nnfb.control(organizacaoFormModel?.idEstado ?? null),
      idPais: this._nnfb.control(organizacaoFormModel?.idPais ?? null, {
        validators: Validators.required,
      }),
      idTipoOrganizacao: this._nnfb.control(
        organizacaoFormModel?.idTipoOrganizacao ?? null,
        {
          validators: Validators.required,
        }
      ),
    });

    this.organizacaoFormValueChanges();
  }

  private organizacaoFormValueChanges(): void {
    const idPaisFormControl = this.organizacaoForm.get('idPais') as FormControl<
      number | null
    >;

    const idEstadoFormControl = this.organizacaoForm.get(
      'idEstado'
    ) as FormControl<number | null>;

    const idCidadeFormControl = this.organizacaoForm.get(
      'idCidade'
    ) as FormControl<number | null>;

    const cnpjFormControl = this.organizacaoForm.get('cnpj') as FormControl<
      string | null
    >;

    cnpjFormControl.markAsTouched();

    idPaisFormControl.valueChanges.subscribe((idPaisValue) => {
      if (!idPaisValue) {
        idEstadoFormControl.patchValue(null);
        idCidadeFormControl.patchValue(null);
        this.estadosOpcoes = [];
        this.cidadesOpcoes = [];
        cnpjFormControl.clearValidators();
      } else {
        this._opcoesDropdownService
          .getOpcoesEstados(idPaisValue)
          .pipe(tap((response) => (this.estadosOpcoes = response)))
          .subscribe();

        idPaisValue === 1
          ? cnpjFormControl.setValidators([Validators.required])
          : cnpjFormControl.clearValidators();
      }

      cnpjFormControl.updateValueAndValidity();
    });

    idEstadoFormControl.valueChanges.subscribe((idEstadoValue) => {
      if (!idEstadoValue) {
        idCidadeFormControl.patchValue(null);
        this.cidadesOpcoes = [];
      } else {
        this._opcoesDropdownService
          .getOpcoesCidades('ESTADO', idEstadoValue)
          .pipe(tap((response) => (this.cidadesOpcoes = response)))
          .subscribe();
      }
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
        this.submitOrganizationForm(this.organizacaoForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const organizacaoFormControls = this.organizacaoForm.controls;

    alterarEstadoControlesFormulario(permitir, organizacaoFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'organizacoes']);
  }

  private submitOrganizationForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new OrganizacaoFormModel(form.value as IOrganizacaoForm);

    const requisicao = this._idOrganizacaoEdicao
      ? this.atualizarOrganizacao(payload)
      : this.cadastrarOrganizacao(payload);

    requisicao.subscribe();
  }

  private cadastrarOrganizacao(
    payload: OrganizacaoFormModel
  ): Observable<IOrganizacao> {
    return this._organizacoesService
      .post(payload, this.arquivoImagemOrganizacao)
      .pipe(
        tap((response: IOrganizacao) => {
          this._toastService.showToast(
            'success',
            'Organização cadastrada com sucesso.'
          );
        }),
        finalize(() => this.cancelar())
      );
  }

  private atualizarOrganizacao(
    payload: OrganizacaoFormModel
  ): Observable<IOrganizacao> {
    return this._organizacoesService
      .put(this._idOrganizacaoEdicao, payload, this.arquivoImagemOrganizacao)
      .pipe(
        tap((response: IOrganizacao) => {
          this._toastService.showToast(
            'success',
            'Organização alterada com sucesso.'
          );
        }),
        finalize(() => this.cancelar())
      );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._organizacoesService.idOrganizacao$.next(0);
  }
}
