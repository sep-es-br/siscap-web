import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, finalize, first, tap } from 'rxjs';

import { OrganizacoesService } from '../../../shared/services/organizacoes/organizacoes.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import {
  IOrganization,
  IOrganizationCreate,
} from '../../../shared/interfaces/organization.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { FormDataHelper } from '../../../shared/helpers/form-data.helper';

@Component({
  selector: 'siscap-organization-form',
  standalone: false,
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss',
})
export class OrganizationFormComponent implements OnInit {
  @ViewChild('imagemPerfil') imagemPerfilInput!: ElementRef<HTMLInputElement>;

  // private _subscription: Subscription = new Subscription();

  private _prepareForm$!: Observable<IOrganization>;
  // private _getOrganizacoes$: Observable<ISelectList[]>;
  // private _getPessoas$: Observable<ISelectList[]>;
  // private _getPaises$: Observable<ISelectList[]>;
  // private _getT$: Observable<ISelectList[]>;
  // private _getTiposOrganizacoes$: Observable<ISelectList[]>;

  public loading: boolean = false;

  public organizationForm!: FormGroup;

  public formMode: string;

  public organizationEditId!: number;
  public organizationFormInitialValue!: IOrganizationCreate;

  public uploadedPhotoFile: File | undefined;
  public uploadedPhotoSrc: string = '';

  public tiposOrganizacoesList: Array<ISelectList> = [];
  public paisesList: Array<ISelectList> = [];
  public estadosList: Array<ISelectList> = [];
  public cidadesList: Array<ISelectList> = [];
  public organizacoesList: Array<ISelectList> = [];
  public pessoasList: Array<ISelectList> = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService,
    private _selectListService: SelectListService,
    private _toastService: ToastService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.organizationEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._prepareForm$ = this._organizacoesService
      .getOrganizacaoById(this.organizationEditId)
      .pipe(
        first(),
        tap((response) => {
          this.initForm(response);
          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        finalize(() => {
          this.organizationFormInitialValue = this.organizationForm.value;

          if (this.formMode == 'detalhes') {
            const controls = this.organizationForm.controls;
            for (const key in controls) {
              controls[key].disable();
            }
          }

          this.loading = false;
        })
      );

    this._selectListService
      .getTiposOrganizacoes()
      .pipe(
        first(),
        tap((response) => (this.tiposOrganizacoesList = response))
      )
      .subscribe();

    this._selectListService
      .getPaises()
      .pipe(
        first(),
        tap((response) => {
          this.paisesList = response;
        })
      )
      .subscribe();

    this._selectListService
      .getOrganizacoes()
      .pipe(
        first(),
        tap((response) => {
          this.organizacoesList = response;
        })
      )
      .subscribe();

    this._selectListService
      .getPessoas()
      .pipe(
        first(),
        tap((response) => {
          this.pessoasList = response;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    if (this.formMode == 'criar') {
      this.initForm();
      return;
    }

    this.loading = true;

    this._prepareForm$.subscribe((organizacao) => {
      this.paisChanged(organizacao.idPais);
    });
  }

  initForm(organization?: IOrganization) {
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
      idOrganizacaoPai: nnfb.control(organization?.idOrganizacaoPai ?? null),
      idPessoaResponsavel: nnfb.control(
        organization?.idPessoaResponsavel ?? null
      ),
      idCidade: nnfb.control(organization?.idCidade ?? null),
      idEstado: nnfb.control(organization?.idEstado ?? null),
      idPais: nnfb.control(organization?.idPais ?? null, {
        validators: Validators.required,
      }),
      idTipoOrganizacao: nnfb.control(organization?.idTipoOrganizacao ?? null, {
        validators: Validators.required,
      }),
    });
  }

  paisChanged(value: number | undefined) {
    if (!value) {
      this.estadosList = [];
      return;
    }

    this._selectListService
      .getEstados(value)
      .pipe(
        first(),
        tap((response) => (this.estadosList = response))
      )
      .subscribe();
  }

  estadoChanged(value: number | undefined) {
    if (!value) {
      this.cidadesList = [];
      return;
    }

    this._selectListService
      .getCidades('ESTADO', value)
      .pipe(
        first(),
        tap((response) => (this.cidadesList = response))
      )
      .subscribe();
  }

  convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return !!data ? 'data:image/jpeg;base64,' + data : '';
  }

  attachImg(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.uploadedPhotoFile = event.target.files[0];
      this.uploadedPhotoSrc = URL.createObjectURL(event.target.files[0]);
    }
  }

  removeImg() {
    this.imagemPerfilInput.nativeElement.value = '';
    this.uploadedPhotoFile = undefined;
    this.uploadedPhotoSrc = '';
  }

  cancelForm() {
    this._router.navigate(['main', 'organizacoes']);
  }

  submitOrganizationForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
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
}
