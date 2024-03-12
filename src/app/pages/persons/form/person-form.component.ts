import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IPerson,
  IPersonCreate,
  IPersonEdit,
} from '../../../shared/interfaces/person.interface';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaFormLists } from '../../../shared/helpers/pessoa-form-lists.helper';
import { finalize } from 'rxjs';

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

  // Por hora, lista de valores hard-coded
  public nacionalidadesList = PessoaFormLists.nacionalidadesList;
  public generosList = PessoaFormLists.generosList;

  constructor(
    private _fb: FormBuilder,
    private _pessoasService: PessoasService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.personEditId = this._route.snapshot.queryParams['id'] ?? null;
  }

  ngOnInit(): void {
    if (this.formMode == 'criar') {
      this.initForm();
      return;
    }

    this.loading = true;

    this._pessoasService
      .getPessoaById(this.personEditId)
      .pipe(
        finalize(() => {
          this.personFormInitialValue = this.personForm.value;
          this.loading = false;
        })
      )
      .subscribe((response) => {
        console.log(response);
        this.initForm(response);
        this.uploadedPhotoFile =
          this.convertByteArraytoImgFile(
            response.imagemPerfil as ArrayBuffer
          ) ?? undefined;
        this.uploadedPhotoSrc =
          this.convertByteArraytoImgSrc(response.imagemPerfil as ArrayBuffer) ??
          '';
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

  cancelForm() {
    this._router.navigate(['main', 'pessoas']);
  }

  //ArrayBuffer já está em base64
  convertByteArraytoImgFile(data: ArrayBuffer): File {
    const test = new File([data], 'test');
    console.log(test);
    return test;
    // return new File([data], 'test');

    // const reader = new FileReader();

    // reader.onload = (e) => {
    //   console.log(e);
    // };

    // reader.read()

    // const test = new Blob([new Uint]);
  }

  convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
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
        // const createPayload = form.value as IPersonCreate;

        const createPayload = this.appendFormGrouptoFormData(
          form.value as IPersonCreate
        );

        if (!!this.uploadedPhotoFile) {
          createPayload.append('imagemPerfil', this.uploadedPhotoFile);
        }

        // createPayload.forEach((v, k) => {
        //   console.log(`${k}: ${v}`);
        // });

        this._pessoasService.postPessoa(createPayload).subscribe((response) => {
          console.log(response);
          if (response) {
            alert('Perfil cadastrado com sucesso.');
            this._router.navigate(['main', 'pessoas']);
          }
        });
        break;

      case 'editar':
        //editar
        break;

      default:
        break;
    }
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
}


/* 
Foto de perfil:
- Alinhar campo de imagem para esquerda
- SUbstituir interrogação por avatar de usuario
*/