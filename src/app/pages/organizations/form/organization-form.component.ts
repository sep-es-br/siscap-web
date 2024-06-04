import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {concat, finalize, Observable, Subscription, tap} from 'rxjs';

import {OrganizacoesService} from '../../../shared/services/organizacoes/organizacoes.service';
import {SelectListService} from '../../../shared/services/select-list/select-list.service';
import {ToastService} from '../../../shared/services/toast/toast.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumb/breadcrumb.service';

import {IOrganization, IOrganizationCreate} from '../../../shared/interfaces/organization.interface';
import {ISelectList} from '../../../shared/interfaces/select-list.interface';

import {FormDataHelper} from '../../../shared/helpers/form-data.helper';
import {ProfileService} from '../../../shared/services/profile/profile.service';

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
  private _getEstados$!: Observable<ISelectList[]>;
  private _getCidades$!: Observable<ISelectList[]>;
  private _getPessoas$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _getOrganizacaoById$!: Observable<IOrganization>;

  private _subscription: Subscription = new Subscription();

  public organizationForm!: FormGroup;

  public loading: boolean = true;

  public formMode: string;
  public isEdit!: boolean;

  public organizationEditId!: number;
  public organizationFormInitialValue!: IOrganizationCreate;

  public uploadedPhotoFile: File | undefined;
  public photoOrganization: string = '';

  public tiposOrganizacoesList: Array<ISelectList> = [];
  public organizacoesList: Array<ISelectList> = [];
  public paisesList: Array<ISelectList> = [];
  public estadosList: Array<ISelectList> = [];
  public cidadesList: Array<ISelectList> = [];
  public pessoasList: Array<ISelectList> = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileService,
    private _organizacoesService: OrganizacoesService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.organizationEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._getOrganizacaoById$ = this._organizacoesService
      .getOrganizacaoById(this.organizationEditId)
      .pipe(
        tap((response) => {
          this.initForm(response);

          this.photoOrganization = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        tap((response) => {
          this.paisChanged(response.idPais);
          this.estadoChanged(response.idEstado);
        }),
        finalize(() => {
          this.organizationFormInitialValue = this.organizationForm.value;

          this.switchMode(!!this._route.snapshot.queryParamMap.get('isEdit'));

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

    this._subscription.add(this._breadcrumbService.breadcrumbAction.subscribe((actionType: string) => {
      this.handleActionBreadcrumb(actionType);
    }));
  }

  private initForm(organization?: IOrganization) {
    const nnfb = this._formBuilder.nonNullable;
    this.organizationForm = nnfb.group({
      nome: nnfb.control(organization?.nome ?? '', {
        validators: Validators.required,
      }),
      abreviatura: nnfb.control(organization?.abreviatura ?? '', {
        validators: Validators.required,
      }),
      telefone: nnfb.control(organization?.telefone ?? ''),
      cnpj: nnfb.control(organization?.cnpj ?? '', {
        validators: [Validators.minLength(14), Validators.maxLength(14)],
      }),
      fax: nnfb.control(organization?.fax ?? ''),
      email: nnfb.control(organization?.email ?? '', {
        validators: Validators.email,
      }),
      site: nnfb.control(organization?.site ?? ''),
      idOrganizacaoPai: nnfb.control(
        organization?.idOrganizacaoPai?.toString() ?? null
      ),
      idPessoaResponsavel: nnfb.control(
        organization?.idPessoaResponsavel?.toString() ?? null
      ),
      idCidade: nnfb.control(organization?.idCidade?.toString() ?? null),
      idEstado: nnfb.control(organization?.idEstado?.toString() ?? null),
      idPais: nnfb.control(organization?.idPais.toString() ?? null, {
        validators: Validators.required,
      }),
      idTipoOrganizacao: nnfb.control(
        organization?.idTipoOrganizacao.toString() ?? null,
        {
          validators: Validators.required,
        }
      ),
    });
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    if (this.formMode == 'criar') {
      this.initForm();
      this.loading = false;
      return;
    }

    this._subscription.add(this._getOrganizacaoById$.subscribe());
  }

  public paisChanged(value: number | undefined) {
    if (!value) {
      this.organizationForm.get('idEstado')?.patchValue(null);
      this.organizationForm.get('idCidade')?.patchValue(null);
      this.estadosList = [];
      this.cidadesList = [];
      return;
    }

    this._getEstados$ = this._selectListService
      .getEstados(value)
      .pipe(tap((response) => (this.estadosList = response)));

    this._subscription.add(this._getEstados$.subscribe());
  }

  public estadoChanged(value: number | undefined) {
    if (!value) {
      this.organizationForm.get('idCidade')?.patchValue(null);
      this.cidadesList = [];
      return;
    }

    this._getCidades$ = this._selectListService
      .getCidades('ESTADO', value)
      .pipe(tap((response) => (this.cidadesList = response)));

    this._subscription.add(this._getCidades$.subscribe());
  }

  public convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return !!data ? 'data:image/jpeg;base64,' + data : '';
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  public switchMode(isEnabled: boolean) {
    this.isEdit = isEnabled;

    const controls = this.organizationForm.controls;
    for (const key in controls) {
      isEnabled
        ? controls[key].enable()
        : controls[key].disable();
    }
  }

  public cancelForm() {
    this._router.navigate(['main', 'organizacoes']);
  }

  public submitOrganizationForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = FormDataHelper.appendFormGrouptoFormData(form.value);

    if (!!this.uploadedPhotoFile) {
      payload.append('imagemPerfil', this.uploadedPhotoFile);
    }

    switch (this.formMode) {
      case 'criar':
        this._organizacoesService
          .postOrganizacao(payload)
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
          .putOrganizacao(this.organizationEditId, payload)
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

  public handleActionBreadcrumb(actionType: string) {
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
        this.submitOrganizationForm(this.organizationForm);
        break;
    }
  }

  profilePhoto(event: any){
    this.uploadedPhotoFile = event[0];
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
