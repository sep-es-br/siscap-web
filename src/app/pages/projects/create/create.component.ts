import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent implements OnInit {
  public projectForm!: FormGroup;
  // public projectCreateObj: projectCreateModel = {
  //   sigla: 'asd',
  //   titulo: 'teste',
  //   idEntidade: 0,
  //   valorEstimado: 0,
  //   idMicrorregioes: [],
  //   objetivo: '',
  //   objetivoEspecifico: '',
  //   situacaoProblema: '',
  //   solucoesPropostas: '',
  //   impactos: '',
  //   arranjosInstitucionais: '',
  // };

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    console.log(this.projectForm.value);
  }

  initForm() {
    this.projectForm = this._fb.group({
      sigla: this._fb.control('', [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._fb.control('', [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idEntidade: this._fb.control(0, [Validators.required, Validators.min(0)]),
      valorEstimado: this._fb.control(0, [
        Validators.required,
        Validators.min(0),
      ]),
      idMicrorregioes: this._fb.array([], Validators.required),
      objetivo: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      objetivoEspecifico: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      situacaoProblema: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      solucoesPropostas: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      impactos: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      arranjosInstitucionais: this._fb.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
    });
  }

  submitProjectCreateForm() {
    console.log(this.projectForm.value);
  }
}
