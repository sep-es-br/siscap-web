import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, finalize, first, tap } from 'rxjs';

import * as _ from 'lodash';

import {
  IProject,
  IProjectCreate,
  IProjectEdit,
} from '../../../shared/interfaces/project.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';
import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit {
  public projectForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  private _prepareForm$!: Observable<IProject>;
  public projectEditId!: number;
  public projectFormInitialValue!: IProjectCreate;

  public microrregioesList: ISelectList[] = [];
  public entidadesList: ISelectList[] = [];
  public planosList: ISelectList[] = [];
  public pessoasList: ISelectList[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _projetosService: ProjetosService,
    private _selectListService: SelectListService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.projectEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._prepareForm$ = this._projetosService
      .getProjetoById(this.projectEditId)
      .pipe(
        first(),
        tap((response) => {
          this.initForm(response);
        }),
        finalize(() => {
          this.projectFormInitialValue = this.projectForm.value;

          if (this.formMode == 'detalhes') {
            const controls = this.projectForm.controls;
            for (const key in controls) {
              controls[key].disable();
            }
          }

          this.loading = false;
        })
      );

    this._selectListService
      .getMicrorregioes()
      .pipe(
        first(),
        tap((response) => {
          this.microrregioesList = response;
        })
      )
      .subscribe();

    this._selectListService
      .getEntidades()
      .pipe(
        first(),
        tap((response) => {
          this.entidadesList = response;
        })
      )
      .subscribe();

    this._selectListService
      .getPlanos()
      .pipe(
        first(),
        tap((response) => {
          this.planosList = response;
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

    this._prepareForm$.subscribe();
  }

  /**
   * Método para inicialização do formulário.
   *
   */
  initForm(project?: IProject) {
    const nnfb = this._formBuilder.nonNullable;
    this.projectForm = nnfb.group({
      sigla: nnfb.control(project?.sigla ?? '', {
        validators: [Validators.required, Validators.maxLength(12)],
      }),
      titulo: nnfb.control(project?.titulo ?? '', {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      idEntidade: nnfb.control(project?.idEntidade ?? null, {
        validators: Validators.required,
      }),
      valorEstimado: nnfb.control(project?.valorEstimado ?? null, {
        validators: [Validators.required, Validators.min(1)],
      }),
      idMicrorregioes: nnfb.control(project?.idMicrorregioes ?? [], {
        validators: Validators.required,
      }),
      objetivo: nnfb.control(project?.objetivo ?? '', {
        validators: [Validators.required, Validators.maxLength(2000)],
      }),
      objetivoEspecifico: nnfb.control(project?.objetivoEspecifico ?? '', {
        validators: [Validators.required, Validators.maxLength(2000)],
      }),
      situacaoProblema: nnfb.control(project?.situacaoProblema ?? '', {
        validators: [Validators.required, Validators.maxLength(2000)],
      }),
      solucoesPropostas: nnfb.control(project?.solucoesPropostas ?? '', {
        validators: [Validators.required, Validators.maxLength(2000)],
      }),
      impactos: nnfb.control(project?.impactos ?? '', {
        validators: [Validators.required, Validators.maxLength(2000)],
      }),
      arranjosInstitucionais: nnfb.control(
        project?.arranjosInstitucionais ?? '',
        {
          validators: [Validators.required, Validators.maxLength(2000)],
        }
      ),
      idPessoasEquipeElab: nnfb.control(project?.idPessoasEquipeElab ?? [], {
        validators: Validators.required,
      }),
      idPlano: nnfb.control(project?.idPlano ?? [], {
        validators: Validators.required,
      }),
      //AInda não implementados
      eixo: nnfb.control({ value: null, disabled: true }),
      area: nnfb.control({ value: null, disabled: true }),
    });
  }

  /**
   * Método para cancelar o preenchimento do formulário.
   * Envia o usuário para a página de listagem de projetos
   *
   */
  cancelForm() {
    this._router.navigate(['main', 'projetos']);
  }

  /**
   * Método para enviar o formulário. Verifica o formMode e chama o método apropriado
   * do serviço ProjetosService.
   *
   * @param form - O `FormGroup` do formulário
   *
   */
  submitProjectForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      // alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    //TODO: Tratamento de erro (caso sigla duplicada)
    switch (this.formMode) {
      case 'criar':
        const createPayload = form.value as IProjectCreate;

        this._projetosService
          .postProjeto(createPayload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Projeto cadastrado com sucesso.');
              this._router.navigate(['main', 'projetos']);
            }
          });
        break;

      case 'editar':
        const editPayload = this.prepareEditForm(
          form.value,
          this.projectFormInitialValue
        ) as IProjectEdit;

        this._projetosService
          .putProjeto(this.projectEditId, editPayload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Projeto alterado com sucesso.');
              this._router.navigate(['main', 'projetos']);
            }
          });
        break;

      default:
        break;
    }
  }

  prepareEditForm(formCurrentValue: any, formInitialValue: any) {
    return _.pickBy(formCurrentValue, (value, key) => {
      return value != formInitialValue[key];
    });
  }
}
