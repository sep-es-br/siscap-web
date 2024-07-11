import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

import { finalize, Observable, Subscription, tap } from 'rxjs';

import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import {
  IPerson,
  IPersonACApi,
  IPersonCreate,
} from '../../../shared/interfaces/person.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { PessoaFormLists } from '../../../shared/utils/pessoa-form-lists';
import { FormDataHelper } from '../../../shared/helpers/form-data.helper';
import { CPFValidator } from '../../../shared/helpers/cpf-validator.helper';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

@Component({
  selector: 'siscap-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.scss',
})
export class PersonFormComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('imagemPerfil') imagemPerfilInput!: ElementRef<HTMLInputElement>;
  @ViewChild('importPersonModal') importPersonModal!: TemplateRef<any>;
  @ViewChild('confirmPersonChangeSwal') confirmPersonChangeSwal!: SwalComponent;

  private modalOptions: NgbModalOptions = {
    ariaLabelledBy: 'import-person-modal',
    backdrop: 'static',
    centered: true,
    keyboard: false,
    size: 'md',
  };

  private _getPaises$!: Observable<ISelectList[]>;
  private _getEstados$!: Observable<ISelectList[]>;
  private _getCidades$!: Observable<ISelectList[]>;
  private _getOrganizacoes$!: Observable<ISelectList[]>;
  private _getAreasAtuacao$!: Observable<ISelectList[]>;

  private _getPessoaById$!: Observable<IPerson>;
  private _getPessoaBySubNovo$!: Observable<IPerson>;
  private _isPersonResponsibleOrganization!: boolean;

  private _subscription: Subscription = new Subscription();

  public personForm!: FormGroup;
  public importByCpfForm!: FormGroup;

  public loading: boolean = true;

  public formMode!: string;
  public isEdit: boolean = false;

  public personEditId!: number;
  public personEditSubNovo!: string;
  public personFormInitialValue!: IPersonCreate;

  public uploadedPhotoFile: File | undefined;
  public uploadedPhotoSrc: string = '';

  public paisesList: ISelectList[] = [];
  public estadosList: ISelectList[] = [];
  public cidadesList: ISelectList[] = [];
  public organizacoesList: ISelectList[] = [];
  public areasAtuacaoList: ISelectList[] = [];

  public paisSelected: string | undefined;
  public estadoSelected: string | undefined;

  // Por hora, lista de valores hard-coded
  public nacionalidadesList = PessoaFormLists.nacionalidadesList;
  public generosList = PessoaFormLists.generosList;

  public confirmPersonChangeSwalText: string =
    '<span>A pessoa já está cadastrada como responsável da organização: </span>' +
    '<br />' +
    '<br />' +
    '<b>idOrganizacao</b>' +
    '<br />' +
    '<br />' +
    '<span>Alterar a organização a qual esta pessoa pertence irá desvincula-la como responsável da organização acima!</span>'

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileService,
    private _pessoasService: PessoasService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService,
    private _modalService: NgbModal
  ) {
    this.formMode = this._route.snapshot.paramMap.get('mode') ?? '';
    this.personEditId =
      Number(this._route.snapshot.queryParamMap.get('id')) ?? null;
    this.personEditSubNovo =
      this._route.snapshot.queryParamMap.get('subNovo') ?? '';

    this._getPessoaById$ = this._pessoasService
      .getPessoaById(this.personEditId)
      .pipe(
        tap((response) => {
          this.initForm(response);

          this._isPersonResponsibleOrganization =
            response.isResponsavelOrganizacao;

          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        tap((response) => {
          this.paisSelected =
            response.endereco?.idPais?.toString() ?? undefined;
          this.estadoSelected =
            response.endereco?.idEstado?.toString() ?? undefined;
        }),
        finalize(() => {
          this.personFormInitialValue = this.personForm.value;

          this.paisChanged(this.paisSelected);
          this.estadoChanged(this.estadoSelected);

          this.switchMode(!!this._route.snapshot.queryParamMap.get('isEdit'));

          this.loading = false;
        })
      );

    this._getPessoaBySubNovo$ = this._pessoasService
      .getMeuPerfil(this.personEditSubNovo)
      .pipe(
        tap((response) => {
          this.initForm(response);

          this.personEditId = response.id;

          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        tap((response) => {
          this.paisSelected =
            response.endereco?.idPais?.toString() ?? undefined;
          this.estadoSelected =
            response.endereco?.idEstado?.toString() ?? undefined;
        }),
        finalize(() => {
          this.personFormInitialValue = this.personForm.value;

          this.paisChanged(this.paisSelected);
          this.estadoChanged(this.estadoSelected);

          this.switchMode(false);

          this.loading = false;
        })
      );

    this._subscription.add(
      this._breadcrumbService.breadcrumbAction.subscribe(
        (actionType: string) => {
          this.handleActionBreadcrumb(actionType);
        }
      )
    );

    this._getPaises$ = this._selectListService
      .getPaises()
      .pipe(tap((response) => (this.paisesList = response)));

    this._getAreasAtuacao$ = this._selectListService
      .getAreasAtuacao()
      .pipe(tap((response) => (this.areasAtuacaoList = response)));

    this._getOrganizacoes$ = this._selectListService
      .getOrganizacoes()
      .pipe(tap((response) => (this.organizacoesList = response)));
  }

  /**
   * @private
   * Método para inicialização do formulário. Popula valor inicial dos controles com valor original do usuário, caso houver.
   * Se não, inicial com controles vazios.
   *
   * @param {IPerson} person - Valor inicial do usuário.
   */
  private initForm(person?: IPerson) {
    const nnfb = this._formBuilder.nonNullable;
    this.personForm = nnfb.group({
      sub: nnfb.control(undefined),
      nome: nnfb.control(person?.nome ?? '', {
        validators: Validators.required,
      }),
      nomeSocial: nnfb.control(person?.nomeSocial ?? ''),
      nacionalidade: nnfb.control(person?.nacionalidade ?? null, {
        validators: Validators.required,
      }),
      genero: nnfb.control(person?.genero ?? null, {
        validators: Validators.required,
      }),
      cpf: nnfb.control(person?.cpf ?? '', {
        validators: [
          Validators.minLength(11),
          Validators.maxLength(11),
          CPFValidator,
        ],
      }),
      email: nnfb.control(person?.email ?? '', {
        validators: [Validators.required, Validators.email],
      }),
      telefoneComercial: nnfb.control(person?.telefoneComercial ?? ''),
      telefonePessoal: nnfb.control(person?.telefonePessoal ?? ''),
      endereco: nnfb.group({
        rua: nnfb.control(person?.endereco?.rua ?? ''),
        numero: nnfb.control(person?.endereco?.numero ?? ''),
        bairro: nnfb.control(person?.endereco?.bairro ?? ''),
        complemento: nnfb.control(person?.endereco?.complemento ?? ''),
        codigoPostal: nnfb.control(person?.endereco?.codigoPostal ?? ''),
        idPais: nnfb.control({
          value: person?.endereco?.idPais?.toString() ?? null,
          disabled: !this.isEdit && this.formMode != 'criar',
        }),
        idEstado: nnfb.control({
          value: person?.endereco?.idEstado?.toString() ?? null,
          disabled: !this.isEdit && this.formMode != 'criar',
        }),
        idCidade: nnfb.control(person?.endereco?.idCidade?.toString() ?? null),
      }),
      idOrganizacao: nnfb.control(person?.idOrganizacao?.toString() ?? null),
      idAreasAtuacao: nnfb.control(person?.idAreasAtuacao ?? []),
    });
    const enderecoGroup = this.personForm.get('endereco');
    const idPaisControl = enderecoGroup?.get('idPais');
    const idEstadoControl = enderecoGroup?.get('idEstado');
    const idCidadeControl = enderecoGroup?.get('idCidade');

    this.requiredAddressFields(
      idPaisControl,
      idEstadoControl,
      idCidadeControl,
      enderecoGroup
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getPaises$.subscribe());
    this._subscription.add(this._getAreasAtuacao$.subscribe());
    this._subscription.add(this._getOrganizacoes$.subscribe());

    if (this.formMode == 'criar') {
      this.initForm();
      this.loading = false;
      return;
    }

    if (this.personEditId) {
      this._subscription.add(this._getPessoaById$.subscribe());
    } else if (this.personEditSubNovo) {
      this._subscription.add(this._getPessoaBySubNovo$.subscribe());
    }
  }

  ngAfterViewInit(): void {
    if (this.formMode == 'criar') {
      const nnfb = this._formBuilder.nonNullable;
      this.importByCpfForm = nnfb.group({
        cpfImport: nnfb.control(undefined),
      });
      this.open(this.importPersonModal);
    }
  }

  public paisChanged(value: string | undefined) {
    if (!value) {
      this.personForm.get('endereco.idEstado')?.patchValue(null);
      this.personForm.get('endereco.idCidade')?.patchValue(null);
      this.estadosList = [];
      this.cidadesList = [];
      return;
    }

    const valueAsNumber = parseInt(value);

    this._getEstados$ = this._selectListService
      .getEstados(valueAsNumber)
      .pipe(tap((response) => (this.estadosList = response)));

    this._subscription.add(this._getEstados$.subscribe());
  }

  public estadoChanged(value: string | undefined) {
    if (!value) {
      this.personForm.get('endereco.idCidade')?.patchValue(null);
      this.cidadesList = [];
      return;
    }

    const valueAsNumber = parseInt(value);

    this._getCidades$ = this._selectListService
      .getCidades('ESTADO', valueAsNumber)
      .pipe(tap((response) => (this.cidadesList = response)));

    this._subscription.add(this._getCidades$.subscribe());
  }

  public organizationChanged(event: string) {
    const orgName = this.organizacoesList.find((org) => org.id == this.personFormInitialValue.idOrganizacao.toString())?.nome;

    if (
      Number(event) != this.personFormInitialValue.idOrganizacao &&
      this._isPersonResponsibleOrganization
    ) {
      this.confirmPersonChangeSwalText = this.confirmPersonChangeSwalText.replace('idOrganizacao', orgName ?? '');
      
      setTimeout(() => {
        this.confirmPersonChangeSwal.fire();
      }, 0);
    }
  }

  public convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return !!data ? 'data:image/jpeg;base64,' + data : '';
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  public switchMode(isEnabled: boolean, excluded?: Array<string>) {
    this.isEdit = isEnabled;

    const controls = this.personForm.controls;
    for (const key in controls) {
      !excluded?.includes(key) && isEnabled
        ? controls[key].enable()
        : controls[key].disable();
    }
  }

  public cancelForm() {
    this._router.navigate(['main', 'pessoas']);
  }

  public submitPersonForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = FormDataHelper.appendFormGrouptoFormData(
      form.getRawValue(),
      'endereco'
    );

    if (!!this.uploadedPhotoFile) {
      payload.append('imagemPerfil', this.uploadedPhotoFile);
    }

    switch (this.formMode) {
      case 'criar':
        this._pessoasService
          .postPessoa(payload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Pessoa cadastrada com sucesso.'
                );
                this._router.navigateByUrl('main/pessoas');
              }
            })
          )
          .subscribe();

        break;

      case 'editar':
        this._pessoasService
          .putPessoa(this.personEditId, payload, !!this.personEditSubNovo)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Pessoa alterada com sucesso.'
                );
                let perfil = JSON.parse(
                  sessionStorage.getItem('user-profile') ?? '{}'
                );
                if (perfil?.email == response.email) {
                  perfil.imagemPerfil = response.imagemPerfil;
                  this._profileService.atualizarPerfil(perfil);
                }
                this._router.navigateByUrl('main/pessoas');
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
        this.switchMode(true, ['email']);
        break;
      case 'cancel':
        this.cancelForm();
        break;
      case 'save':
        this.submitPersonForm(this.personForm);
        break;

      default:
        break;
    }
  }

  profilePhoto(event: any) {
    this.uploadedPhotoFile = event[0];
  }

  private requiredAddressFields(
    idPaisControl: AbstractControl<any, any> | null | undefined,
    idEstadoControl: AbstractControl<any, any> | null | undefined,
    idCidadeControl: AbstractControl<any, any> | null | undefined,
    enderecoGroup: AbstractControl<any, any> | null
  ) {
    [idPaisControl, idEstadoControl, idCidadeControl].forEach((control) => {
      control?.markAsTouched();
    });

    enderecoGroup?.valueChanges.subscribe((endereco) => {
      const enderecoPreenchido = Object.values(endereco).some(
        (value) => !!value
      );

      if (enderecoPreenchido) {
        [idPaisControl, idEstadoControl, idCidadeControl].forEach((control) => {
          if (!control?.validator) {
            control?.setValidators([Validators.required]);
            control?.updateValueAndValidity();
          }
        });
      } else {
        [idPaisControl, idEstadoControl, idCidadeControl].forEach((control) => {
          if (control?.validator) {
            control?.clearValidators();
            control?.updateValueAndValidity();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  open(content: TemplateRef<any>) {
    this._modalService.open(content, this.modalOptions);
  }

  importar() {
    const cpf = this.importByCpfForm.controls['cpfImport'].value;
    if (cpf) {
      this._pessoasService
        .searchACPessoaByCpf(cpf)
        .pipe(
          tap((response) => {
            if (response) {
              this.importFormValues(response);
            }
          })
        )
        .subscribe();
    }
  }

  private importFormValues(response: IPersonACApi) {
    this.personForm.controls['sub'].patchValue(response.sub);
    this.personForm.controls['nome'].patchValue(response.nome);
    this.personForm.controls['email'].patchValue(response.email);
    this.personForm.controls['nomeSocial'].patchValue(response.apelido);
  }
}
