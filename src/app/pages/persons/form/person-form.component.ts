import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, finalize, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../core/components/modal/delete-modal/delete-modal.component';

import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import {
  IPerson,
  IPersonCreate,
} from '../../../shared/interfaces/person.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { PessoaFormLists } from '../../../shared/utils/pessoa-form-lists';
import { FormDataHelper } from '../../../shared/helpers/form-data.helper';
import { CPFValidator } from '../../../shared/helpers/cpf-validator.helper';

@Component({
  selector: 'siscap-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.scss',
})
export class PersonFormComponent implements OnInit, OnDestroy {
  @ViewChild('imagemPerfil') imagemPerfilInput!: ElementRef<HTMLInputElement>;

  private _getPaises$!: Observable<ISelectList[]>;
  private _getEstados$!: Observable<ISelectList[]>;
  private _getCidades$!: Observable<ISelectList[]>;

  private _getPessoaById$!: Observable<IPerson>;

  private _subscription: Subscription = new Subscription();

  public personForm!: FormGroup;

  public loading: boolean = true;

  public formMode!: string;
  public isEdit!: boolean;

  public personEditId!: number;
  public personFormInitialValue!: IPersonCreate;

  public uploadedPhotoFile: File | undefined;
  public uploadedPhotoSrc: string = '';

  public placeholderList: Array<{ id: number; label: string }> = [
    { id: 1, label: 'Valor 1' },
    { id: 2, label: 'Valor 2' },
    { id: 3, label: 'Valor 3' },
    { id: 4, label: 'Valor 4' },
    { id: 5, label: 'Valor 5' },
  ];

  public paisesList: ISelectList[] = [];
  public estadosList: ISelectList[] = [];
  public cidadesList: ISelectList[] = [];

  public paisSelected: number | undefined;
  public estadoSelected: number | undefined;

  // Por hora, lista de valores hard-coded
  public nacionalidadesList = PessoaFormLists.nacionalidadesList;
  public generosList = PessoaFormLists.generosList;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _modalService: NgbModal
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.personEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._getPessoaById$ = this._pessoasService
      .getPessoaById(this.personEditId)
      .pipe(
        tap((response) => {
          this.initForm(response);

          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        tap((response) => {
          this.paisSelected = response.endereco?.idPais ?? undefined;
          this.estadoSelected = response.endereco?.idEstado ?? undefined;
        }),
        finalize(() => {
          this.personFormInitialValue = this.personForm.value;

          this.paisChanged(this.paisSelected);
          this.estadoChanged(this.estadoSelected);

          this.switchMode(false);

          this.loading = false;
        })
      );

    this._getPaises$ = this._selectListService
      .getPaises()
      .pipe(tap((response) => (this.paisesList = response)));
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
        idCidade: nnfb.control(person?.endereco?.idCidade ?? null),
      }),
      //Ainda não implementados
      acessos: nnfb.group({
        grupos: nnfb.control({ value: null, disabled: true }),
        status: nnfb.control({ value: null, disabled: true }),
      }),
      prof: nnfb.group({
        organizacao: nnfb.control({ value: null, disabled: true }),
        dpto: nnfb.control({ value: null, disabled: true }),
        cargo: nnfb.control({ value: null, disabled: true }),
      }),
    });
  }

  ngOnInit(): void {
    this._subscription.add(this._getPaises$.subscribe());

    if (this.formMode == 'criar') {
      this.initForm();
      this.loading = false;
      return;
    }

    this._subscription.add(this._getPessoaById$.subscribe());
  }

  public paisChanged(value: number | undefined) {
    if (!value) {
      this.estadosList = [];
      return;
    }

    this._getEstados$ = this._selectListService
      .getEstados(value)
      .pipe(tap((response) => (this.estadosList = response)));

    this._subscription.add(this._getEstados$.subscribe());
  }

  public estadoChanged(value: number | undefined) {
    if (!value) {
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

  public attachImg(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.uploadedPhotoFile = event.target.files[0];
      this.uploadedPhotoSrc = URL.createObjectURL(event.target.files[0]);
    }
  }

  public removeImg() {
    this.imagemPerfilInput.nativeElement.value = '';
    this.uploadedPhotoFile = undefined;
    this.uploadedPhotoSrc = '';
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
      form.value,
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
          .putPessoa(this.personEditId, payload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Pessoa alterada com sucesso.'
                );
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

  public deletarPessoa(id: number) {
    const deleteModalRef = this._modalService.open(DeleteModalComponent);
    deleteModalRef.componentInstance.title = 'Atenção!';
    deleteModalRef.componentInstance.content =
      'A pessoa será excluída. Tem certeza que deseja prosseguir?';

    deleteModalRef.result.then(
      (resolve) => {
        this._pessoasService
          .deletePessoa(id)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Pessoa excluída com sucesso.'
                );
                this._router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => this._router.navigateByUrl('main/pessoas'));
              }
            })
          )
          .subscribe();
      },
      (reject) => {}
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
