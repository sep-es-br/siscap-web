import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { concat, finalize, Observable, Subscription, tap } from 'rxjs';

import { ProfileService } from '../../../shared/services/profile/profile.service';
import { OrganizacoesService } from '../../../shared/services/organizacoes/organizacoes.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

import {
  IOrganizacao,
  IOrganizacaoForm,
} from '../../../shared/interfaces/organizacao.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import {
  OrganizacaoFormModel,
  OrganizacaoModel,
} from '../../../shared/models/organizacao.model';

import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';
import { converterArrayBufferEmImgSrc } from '../../../shared/utils/convert-array-buffer-image-source';

@Component({
  selector: 'siscap-organizacao-form',
  standalone: false,
  templateUrl: './organizacoes-form.component.html',
  styleUrl: './organizacoes-form.component.scss',
})
export class OrganizacoesFormComponent implements OnInit, OnDestroy {
  private _getTiposOrganizacoes$: Observable<ISelectList[]>;
  private _getOrganizacoes$: Observable<ISelectList[]>;
  private _getPaises$: Observable<ISelectList[]>;
  private _getPessoas$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _getOrganizacaoById$: Observable<IOrganizacao>;

  private _subscription: Subscription = new Subscription();

  private _organizacaoEditId: number;

  public loading: boolean = true;

  public formMode: string;
  public isEdit: boolean = true;

  public organizacaoForm: FormGroup = new FormGroup({});

  public tiposOrganizacoesList: Array<ISelectList> = [];
  public organizacoesList: Array<ISelectList> = [];
  public paisesList: Array<ISelectList> = [];
  public estadosList: Array<ISelectList> = [];
  public cidadesList: Array<ISelectList> = [];
  public pessoasList: Array<ISelectList> = [];

  public srcImagemOrganizacao: string = '';
  public arquivoImagemOrganizacao: File | undefined;

  constructor(
    private _nnfb: NonNullableFormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileService,
    private _organizacoesService: OrganizacoesService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this._organizacaoEditId = Number(
      this._route.snapshot.queryParams['id'] ?? null
    );

    this._getOrganizacaoById$ = this._organizacoesService
      .getById(this._organizacaoEditId)
      .pipe(
        tap((response: IOrganizacao) => {
          const organizacaoModel = new OrganizacaoModel(response);

          this.iniciarForm(organizacaoModel);

          this.srcImagemOrganizacao = converterArrayBufferEmImgSrc(
            organizacaoModel.imagemPerfil
          );
        }),
        finalize(() => {
          this.switchMode(false);
          this.loading = false;
        })
      );

    this._getTiposOrganizacoes$ = this._selectListService
      .getTiposOrganizacoes()
      .pipe(tap((response) => (this.tiposOrganizacoesList = response)));

    this._getOrganizacoes$ = this._selectListService.getOrganizacoes().pipe(
      tap((response) => {
        this.organizacoesList = response;
      })
    );

    this._getPaises$ = this._selectListService.getPaises().pipe(
      tap((response) => {
        this.paisesList = response;
      })
    );

    this._getPessoas$ = this._selectListService.getPessoas().pipe(
      tap((response) => {
        this.pessoasList = response;
      })
    );

    this._getAllSelectLists$ = concat(
      this._getTiposOrganizacoes$,
      this._getOrganizacoes$,
      this._getPaises$,
      this._getPessoas$
    );

    this._subscription.add(
      this._breadcrumbService
        .handleAction(this.handleActionBreadcrumb.bind(this))
        .subscribe()
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    if (this.formMode === 'criar') {
      this.iniciarForm();
      this.loading = false;
      return;
    }

    this._subscription.add(this._getOrganizacaoById$.subscribe());
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

    idPaisFormControl.valueChanges.subscribe((idPais) => {
      if (!idPais) {
        idEstadoFormControl.patchValue(null);
        idCidadeFormControl.patchValue(null);
        this.estadosList = [];
        this.cidadesList = [];
        cnpjFormControl.clearValidators();
      } else {
        this._selectListService
          .getEstados(idPais)
          .pipe(tap((response) => (this.estadosList = response)))
          .subscribe();

        idPais === 1
          ? cnpjFormControl.setValidators([Validators.required])
          : cnpjFormControl.clearValidators();
      }

      cnpjFormControl.updateValueAndValidity();
    });

    idEstadoFormControl.valueChanges.subscribe((idEstado) => {
      if (!idEstado) {
        idCidadeFormControl.patchValue(null);
        this.cidadesList = [];
      } else {
        this._selectListService
          .getCidades('ESTADO', idEstado)
          .pipe(tap((response) => (this.cidadesList = response)))
          .subscribe();
      }
    });
  }

  private isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  private switchMode(isEnabled: boolean): void {
    this.isEdit = isEnabled;

    const controls = this.organizacaoForm.controls;
    for (const key in controls) {
      isEnabled ? controls[key].enable() : controls[key].disable();
      if (controls[key].value === 0) {
        controls[key].patchValue(null);
      }
    }
  }

  private cancelForm(): void {
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

    switch (this.formMode) {
      case 'criar':
        this._organizacoesService
          .post(payload, this.arquivoImagemOrganizacao)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Organização cadastrada com sucesso.'
                );
                this._router.navigateByUrl('main/organizacoes');
              }
            })
          )
          .subscribe();
        break;

      case 'editar':
        this._organizacoesService
          .put(this._organizacaoEditId, payload, this.arquivoImagemOrganizacao)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Organização alterada com sucesso.'
                );
                this._router.navigateByUrl('main/organizacoes');
              }
            })
          )
          .subscribe();
        break;

      default:
        break;
    }
  }

  private handleActionBreadcrumb(actionType: string) {
    switch (actionType) {
      case 'edit':
        if (this.isAllowed('organizacoeseditar')) {
          this.switchMode(true);
        }
        break;

      case 'cancel':
        this.cancelForm();
        break;

      case 'save':
        this.submitOrganizationForm(this.organizacaoForm);
        break;
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
