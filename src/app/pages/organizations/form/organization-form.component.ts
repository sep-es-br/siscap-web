import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { concat, finalize, Observable, Subscription, tap } from 'rxjs';

import { OrganizacoesService } from '../../../shared/services/organizacoes/organizacoes.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

import {
  IOrganization,
  IOrganizationCreate,
} from '../../../shared/interfaces/organization.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { FormDataHelper } from '../../../shared/helpers/form-data.helper';
import {
  IOrganizacao,
  IOrganizacaoForm,
} from '../../../shared/interfaces/organizacao.interface';
import {
  OrganizacaoFormModel,
  OrganizacaoModel,
} from '../../../shared/models/organizacao.model';
import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';

@Component({
  selector: 'siscap-organization-form',
  standalone: false,
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss',
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  private _getTiposOrganizacoes$: Observable<ISelectList[]>;
  private _getOrganizacoes$: Observable<ISelectList[]>;
  private _getPaises$: Observable<ISelectList[]>;
  // private _getEstados$!: Observable<ISelectList[]>;
  // private _getCidades$!: Observable<ISelectList[]>;
  private _getPessoas$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  // private _getOrganizacaoById$!: Observable<IOrganization>;
  private _getOrganizacaoById$: Observable<IOrganizacao>;

  private _subscription: Subscription = new Subscription();

  private _organizacaoEditId: number;

  // public organizationForm!: FormGroup;

  public loading: boolean = true;

  public formMode: string;
  public isEdit: boolean = true;

  public organizacaoForm: FormGroup = new FormGroup({});

  // public organizationEditId!: number;
  // public organizationFormInitialValue!: IOrganizationCreate;

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
    // private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileService,
    private _organizacoesService: OrganizacoesService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    // this.organizationEditId = this._route.snapshot.queryParams['id'] ?? null;
    this._organizacaoEditId = Number(
      this._route.snapshot.queryParams['id'] ?? null
    );

    this._getOrganizacaoById$ = this._organizacoesService
      .getById(this._organizacaoEditId)
      .pipe(
        tap((response: IOrganizacao) => {
          const organizacaoModel = new OrganizacaoModel(response);

          this.iniciarForm(organizacaoModel);

          // this.srcImagemOrganizacao =
          //   organizacaoModel.converterArrayBufferEmImgSrc();

          // this.paisChanged(organizacaoModel.idPais);
          // this.estadoChanged(organizacaoModel.idEstado);
        }),
        finalize(() => {
          this.switchMode(false);
          this.loading = false;
        })
      );

    // this._getOrganizacaoById$ = this._organizacoesService
    //   .getOrganizacaoById(this.organizationEditId)
    //   .pipe(
    //     tap((response) => {
    //       this.initForm(response);

    //       this.photoOrganization = this.convertByteArraytoImgSrc(
    //         response.imagemPerfil as ArrayBuffer
    //       );
    //     }),
    //     tap((response) => {
    //       this.paisChanged(response.idPais);
    //       this.estadoChanged(response.idEstado);
    //     }),
    //     finalize(() => {
    //       this.organizationFormInitialValue = this.organizationForm.value;

    //       this.switchMode(false);

    //       this.loading = false;
    //     })
    //   );

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

  // private initForm(organization?: IOrganization) {
  //   const nnfb = this._formBuilder.nonNullable;
  //   this.organizationForm = nnfb.group({
  //     nome: nnfb.control(organization?.nome ?? '', {
  //       validators: Validators.required,
  //     }),
  //     abreviatura: nnfb.control(organization?.abreviatura ?? '', {
  //       validators: Validators.required,
  //     }),
  //     telefone: nnfb.control(organization?.telefone ?? ''),
  //     cnpj: nnfb.control(organization?.cnpj ?? '', {
  //       validators: [Validators.minLength(14), Validators.maxLength(14)],
  //     }),
  //     fax: nnfb.control(organization?.fax ?? ''),
  //     email: nnfb.control(organization?.email ?? '', {
  //       validators: Validators.email,
  //     }),
  //     site: nnfb.control(organization?.site ?? ''),
  //     idOrganizacaoPai: nnfb.control(organization?.idOrganizacaoPai ?? null),
  //     idPessoaResponsavel: nnfb.control(
  //       organization?.idPessoaResponsavel ?? null
  //     ),
  //     idCidade: nnfb.control(organization?.idCidade ?? null),
  //     idEstado: nnfb.control(organization?.idEstado ?? null),
  //     idPais: nnfb.control(organization?.idPais ?? null, {
  //       validators: Validators.required,
  //     }),
  //     idTipoOrganizacao: nnfb.control(organization?.idTipoOrganizacao ?? null, {
  //       validators: Validators.required,
  //     }),
  //   });

  //   this.validateCnpjRequired();
  // }

  // public idPaisChangeEvent(idPais?: number): void {
  //   if (!idPais) {
  //     this.organizacaoForm.get('idEstado')?.patchValue(null);
  //     this.organizacaoForm.get('idCidade')?.patchValue(null);
  //     this.estadosList = [];
  //     this.cidadesList = [];
  //     return;
  //   }

  //   this._getEstados$ = this._selectListService
  //     .getEstados(idPais)
  //     .pipe(tap((response) => (this.estadosList = response)));

  //   this._subscription.add(this._getEstados$.subscribe());
  // }

  // public idEstadoChangeEvent(idEstado?: number): void {
  //   if (!idEstado) {
  //     this.organizacaoForm.get('idCidade')?.patchValue(null);
  //     this.cidadesList = [];
  //     return;
  //   }

  //   this._getCidades$ = this._selectListService
  //     .getCidades('ESTADO', idEstado)
  //     .pipe(tap((response) => (this.cidadesList = response)));

  //   this._subscription.add(this._getCidades$.subscribe());
  // }

  // public convertByteArraytoImgSrc(data: ArrayBuffer): string {
  //   return !!data ? 'data:image/jpeg;base64,' + data : '';
  // }

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

    // console.log(payload);

    // console.log(this.arquivoImagemOrganizacao);

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

    // const payload = FormDataHelper.appendFormGrouptoFormData(form.value);

    // if (!!this.uploadedPhotoFile) {
    //   payload.append('imagemPerfil', this.uploadedPhotoFile);
    // }

    // switch (this.formMode) {
    //   case 'criar':
    //     this._organizacoesService
    //       .postOrganizacao(payload)
    //       .pipe(
    //         tap((response) => {
    //           if (response) {
    //             this._toastService.showToast(
    //               'success',
    //               'Organização cadastrada com sucesso.'
    //             );
    //             this._router.navigateByUrl('main/organizacoes');
    //           }
    //         })
    //       )
    //       .subscribe();
    //     break;

    //   case 'editar':
    //     this._organizacoesService
    //       .putOrganizacao(this.organizationEditId, payload)
    //       .pipe(
    //         tap((response) => {
    //           if (response) {
    //             this._toastService.showToast(
    //               'success',
    //               'Organização alterada com sucesso.'
    //             );
    //             this._router.navigateByUrl('main/organizacoes');
    //           }
    //         })
    //       )
    //       .subscribe();

    //     break;

    //   default:
    //     break;
    // }
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

  // private validateCnpjRequired() {
  //   const idPaisControl = this.organizationForm.get('idPais');
  //   const cnpjControl = this.organizationForm.get('cnpj');
  //   cnpjControl?.markAsTouched();

  //   idPaisControl?.valueChanges.subscribe((pais) => {
  //     if (pais == 1) {
  //       cnpjControl?.setValidators([Validators.required]);
  //       cnpjControl?.updateValueAndValidity();
  //     } else {
  //       cnpjControl?.clearValidators();
  //       cnpjControl?.updateValueAndValidity();
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
