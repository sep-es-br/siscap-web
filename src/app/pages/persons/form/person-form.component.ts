import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPersonCreate } from '../../../shared/interfaces/person.interface';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.css',
})
export class PersonFormComponent implements OnInit {
  public personForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  public personEditId!: number;
  public personFormInitialValue!: IPersonCreate;

  public uploadedPhotoSrc: string = '';
  public placeholderImg!: any;

  public placeholderList: Array<{ id: number; label: string }> = [
    { id: 1, label: 'Valor 1' },
    { id: 2, label: 'Valor 2' },
    { id: 3, label: 'Valor 3' },
    { id: 4, label: 'Valor 4' },
    { id: 5, label: 'Valor 5' },
  ];

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

    // this.personForm.get('imagemPerfil')?.valueChanges.subscribe((change) => {
    //   console.log(change);
    // });
  }

  initForm() {
    const nnfb = this._fb.nonNullable;
    this.personForm = nnfb.group({
      nome: nnfb.control(''),
      nomeSocial: nnfb.control(''),
      nacionalidade: nnfb.control(null),
      genero: nnfb.control(null),
      cpf: nnfb.control(''),
      email: nnfb.control(''),
      endereco: nnfb.group({
        rua: nnfb.control(''),
        numero: nnfb.control(''),
        bairro: nnfb.control(''),
        complemento: nnfb.control(''),
        codigoPostal: nnfb.control(''),
        idCidade: nnfb.control(null),
      }),
      imagemPerfil: nnfb.control(''),
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
    console.log(form.value);
  }

  attachImg(event: any) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      this.uploadedPhotoSrc = URL.createObjectURL(event.target.files[0]);
    }
  }

  // Não muda o valor do file type input!
  removeImg(event: any) {
    this.uploadedPhotoSrc = '';
  }
}
