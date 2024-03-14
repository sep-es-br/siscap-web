import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, finalize, first, tap } from 'rxjs';

import * as _ from 'lodash';

import {
  IPerson,
  IPersonCreate,
  IPersonEdit,
} from '../../../shared/interfaces/person.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { PessoaFormLists } from '../../../shared/helpers/pessoa-form-lists.helper';

@Component({
  selector: 'app-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.css',
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
    private _fb: FormBuilder,
    private _pessoasService: PessoasService,
    private _selectListService: SelectListService,
    private _route: ActivatedRoute,
    private _router: Router
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
    const nnfb = this._fb.nonNullable;
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

  cancelForm() {
    this._router.navigate(['main', 'pessoas']);
  }

  convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return !!data ? 'data:image/jpeg;base64,' + data : '';
  }

  submitPersonForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      // alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    switch (this.formMode) {
      case 'criar':
        const createPayload = this.appendFormGrouptoFormData(
          form.value as IPersonCreate
        );

        if (!!this.uploadedPhotoFile) {
          createPayload.append('imagemPerfil', this.uploadedPhotoFile);
        }
        this._pessoasService.postPessoa(createPayload).subscribe((response) => {
          console.log(response);
          if (response) {
            alert('Usuário cadastrado com sucesso.');
            this._router.navigate(['main', 'pessoas']);
          }
        });
        break;

      case 'editar':
        let personEditForm = this.prepareEditForm(
          form.value,
          this.personFormInitialValue
        );

        const addressEditForm = this.prepareEditForm(
          form.value['endereco'],
          this.personFormInitialValue['endereco']
        );

        _.isEmpty(addressEditForm)
          ? (personEditForm = _.omit(personEditForm, 'endereco'))
          : (personEditForm['endereco'] = addressEditForm);

        const editPayload = this.appendFormGrouptoFormData(
          personEditForm as IPersonEdit
        );

        if (!!this.uploadedPhotoFile) {
          editPayload.append('imagemPerfil', this.uploadedPhotoFile);
        }

        this._pessoasService
          .putPessoa(this.personEditId, editPayload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Usuário atualizado com sucesso.');
              this._router.navigate(['main', 'pessoas']);
            }
          });

        break;

      default:
        break;
    }
  }

  attachImg(event: any) {
    console.log(this.imagemPerfilInput.nativeElement.value);
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

  appendFormGrouptoFormData(formValue: any): FormData {
    const formData = new FormData();

    for (const key in formValue) {
      const typedKey = key as keyof typeof formValue;

      if (key == 'endereco') {
        for (let enderecoKey in formValue[key]) {
          if (!!formValue[key][enderecoKey]) {
            formData.append(
              `endereco.${enderecoKey}`,
              formValue[key][enderecoKey]
            );
          }
        }
      } else {
        if (!!formValue[typedKey]) {
          formData.append(key, formValue[typedKey]);
        }
      }
    }

    return formData;
  }

  prepareEditForm(formCurrentValue: any, formInitialValue: any) {
    return _.pickBy(formCurrentValue, (value, key) => {
      return value != formInitialValue[key];
    });
  }
}
