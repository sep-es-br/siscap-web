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
import { SelectListService } from '../../../core/services/select-list/select-list.service';
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
import { ISelectList } from '../../../core/interfaces/select-list.interface';

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

  private _getTiposOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getPaisesSelectList$: Observable<ISelectList[]>;
  private _getPessoasSelectList$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _idOrganizacaoEdicao: number = 0;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public organizacaoForm: FormGroup = new FormGroup({});

  public tiposOrganizacoesSelectList: Array<ISelectList> = [];
  public organizacoesSelectList: Array<ISelectList> = [];
  public paisesSelectList: Array<ISelectList> = [];
  public estadosSelectList: Array<ISelectList> = [];
  public cidadesSelectList: Array<ISelectList> = [];
  public pessoasSelectList: Array<ISelectList> = [];

  public srcImagemOrganizacao: string = '';
  public arquivoImagemOrganizacao: File | undefined;

  constructor(
    private _nnfb: NonNullableFormBuilder,
    private _router: Router,
    private _organizacoesService: OrganizacoesService,
    private _selectListService: SelectListService,
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

    this._getTiposOrganizacoesSelectList$ = this._selectListService
      .getTiposOrganizacoes()
      .pipe(tap((response) => (this.tiposOrganizacoesSelectList = response)));

    this._getOrganizacoesSelectList$ = this._selectListService
      .getOrganizacoes()
      .pipe(
        tap((response) => {
          this.organizacoesSelectList = response;
        })
      );

    this._getPaisesSelectList$ = this._selectListService.getPaises().pipe(
      tap((response) => {
        this.paisesSelectList = response;
      })
    );

    this._getPessoasSelectList$ = this._selectListService.getPessoas().pipe(
      tap((response) => {
        this.pessoasSelectList = response;
      })
    );

    this._getAllSelectLists$ = concat(
      this._getTiposOrganizacoesSelectList$,
      this._getOrganizacoesSelectList$,
      this._getPaisesSelectList$,
      this._getPessoasSelectList$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

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
        this.estadosSelectList = [];
        this.cidadesSelectList = [];
        cnpjFormControl.clearValidators();
      } else {
        this._selectListService
          .getEstados(idPaisValue)
          .pipe(tap((response) => (this.estadosSelectList = response)))
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
        this.cidadesSelectList = [];
      } else {
        this._selectListService
          .getCidades('ESTADO', idEstadoValue)
          .pipe(tap((response) => (this.cidadesSelectList = response)))
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
