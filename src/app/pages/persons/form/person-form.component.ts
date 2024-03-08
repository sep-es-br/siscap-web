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
  IPersonCreate,
  IPersonEdit,
} from '../../../shared/interfaces/person.interface';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { ActivatedRoute, Router } from '@angular/router';
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
    this.initForm();
  }

  initForm() {
    const nnfb = this._fb.nonNullable;
    this.personForm = nnfb.group({
      nome: nnfb.control('teste', { validators: Validators.required }),
      nomeSocial: nnfb.control('teste'),
      nacionalidade: nnfb.control(1, { validators: Validators.required }),
      genero: nnfb.control(1, { validators: Validators.required }),
      cpf: nnfb.control('11111111111', {
        validators: [Validators.minLength(11), Validators.maxLength(11)],
      }),
      email: nnfb.control('a@a.a.a', {
        validators: [Validators.required, Validators.email],
      }),
      telefoneComercial: nnfb.control('teste'),
      telefonePessoal: nnfb.control('teste'),
      endereco: nnfb.group({
        rua: nnfb.control('teste'),
        numero: nnfb.control('teste'),
        bairro: nnfb.control('teste'),
        complemento: nnfb.control('teste'),
        codigoPostal: nnfb.control('teste'),
        idCidade: nnfb.control(null),
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

  submitPersonForm(form: FormGroup) {
    if (form.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
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
      this.uploadedPhotoSrc = URL.createObjectURL(this.uploadedPhotoFile!);
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
              `endereco[${enderecoKey}]`,
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
