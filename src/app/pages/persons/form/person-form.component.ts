import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, finalize, first, tap } from 'rxjs';

import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastNotifierService } from '../../../shared/services/toast-notifier/toast-notifier.service';

import {
  IPerson,
  IPersonCreate,
} from '../../../shared/interfaces/person.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { PessoaFormLists } from '../../../shared/utils/pessoa-form-lists';
import { FormDataHelper } from '../../../shared/helpers/form-data.helper';

@Component({
  selector: 'siscap-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.scss',
})
export class PersonFormComponent implements OnInit {
  @ViewChild('imagemPerfil') imagemPerfilInput!: ElementRef<HTMLInputElement>;

  public personForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  private _prepareForm$!: Observable<IPerson>;
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
    private _toastNotifierService: ToastNotifierService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.personEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._prepareForm$ = this._pessoasService
      .getPessoaById(this.personEditId)
      .pipe(
        first(),
        tap((response) => {
          this.initForm(response);
          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        finalize(() => {
          this.personFormInitialValue = this.personForm.value;

          if (this.formMode == 'detalhes') {
            const controls = this.personForm.controls;
            for (const key in controls) {
              controls[key].disable();
            }
          }

          this.loading = false;
        })
      );

    this._selectListService
      .getPaises()
      .pipe(
        first(),
        tap((response) => (this.paisesList = response))
      )
      .subscribe();
  }

  ngOnInit(): void {
    if (this.formMode == 'criar') {
      this.initForm();
      return;
    }

    this.loading = true;

    this._prepareForm$.subscribe((pessoa) => {
      this.paisSelected = pessoa.endereco?.idPais ?? undefined;
      this.paisChanged(this.paisSelected);

      this.estadoSelected = pessoa.endereco?.idEstado ?? undefined;
      this.estadoChanged(this.estadoSelected);
    });
  }

  initForm(person?: IPerson) {
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
        validators: [Validators.minLength(11), Validators.maxLength(11)],
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
        entidade: nnfb.control({ value: null, disabled: true }),
        dpto: nnfb.control({ value: null, disabled: true }),
        cargo: nnfb.control({ value: null, disabled: true }),
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
    this._router.navigate(['main', 'pessoas']);
  }

  submitPersonForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
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
                this._toastNotifierService.notifySuccess('Pessoa', 'POST');
              }
            }),
            finalize(() => {
              this._toastNotifierService.redirectOnToastClose(
                this._router,
                'main/pessoas'
              );
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
                this._toastNotifierService.notifySuccess('Pessoa', 'PUT');
              }
            }),
            finalize(() => {
              this._toastNotifierService.redirectOnToastClose(
                this._router,
                'main/pessoas'
              );
            })
          )
          .subscribe();

        break;

      default:
        break;
    }
  }
}
