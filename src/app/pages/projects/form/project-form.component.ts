import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, finalize, map, tap } from 'rxjs';

import * as _ from 'lodash';

import { projectCreateModel } from '../../../shared/models/projectCreate.model';
import { FormFactoryService } from '../../../shared/services/form-factory/form-factory.service';
import { MicrorregioesService } from '../../../shared/services/microrregioes/microrregioes.service';
import { IMicrorregiao } from '../../../shared/interfaces/microrregiao.interface';
import { EntidadesService } from '../../../shared/services/entidades/entidades.service';
import { IEntidade } from '../../../shared/interfaces/entidade.interface';
import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import {
  IProject,
  ProjectCreate,
  ProjectEdit,
} from '../../../shared/interfaces/project.interface';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  public projectForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  public projectEditId!: number;
  public projectFormInitialValue!: ProjectCreate;

  private _microrregioes$!: Subscription;
  private _entidades$!: Subscription;

  public microrregioesList: IMicrorregiao[] = [];
  public entidadesList: IEntidade[] = [];

  public projectCreateObject: projectCreateModel = {
    sigla: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 12,
      },
    },
    titulo: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 150,
      },
    },
    idEntidade: {
      initialValue: null,
      validators: {
        required: true,
        min: 1,
      },
    },
    valorEstimado: {
      initialValue: null,
      validators: {
        required: true,
        min: 1,
      },
    },
    idMicrorregioes: {
      initialValue: [],
      validators: {
        required: true,
      },
    },
    objetivo: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
    objetivoEspecifico: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
    situacaoProblema: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
    solucoesPropostas: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
    impactos: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
    arranjosInstitucionais: {
      initialValue: '',
      validators: {
        required: true,
        maxLength: 2000,
      },
    },
  };

  constructor(
    private _formFactory: FormFactoryService,
    private _microrregioesService: MicrorregioesService,
    private _entidadesService: EntidadesService,
    private _projetosService: ProjetosService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.projectEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._microrregioes$ = this._microrregioesService
      .getMicrorregioes()
      .pipe(
        tap((value) => {
          this.microrregioesList = value;
        })
      )
      .subscribe();

    this._entidades$ = this._entidadesService
      .getEntidades()
      .pipe(
        tap((value) => {
          this.entidadesList = value;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.initForm();

    if (this.formMode == 'edit' || this.formMode == 'details') {
      this.loading = true;

      // Preenche os controles com os valores do projeto selecionado
      this._projetosService
        .getProjetosById(this.projectEditId)
        .pipe(
          map<IProject, ProjectCreate>((project) => {
            return _.pick(
              project,
              _.keys(this.projectForm.controls)
            ) as ProjectCreate;
          }),
          tap((project) => {
            _.forIn(project, (value, key) => {
              this.projectForm.controls[key]?.setValue(value);
            });
          }),
          finalize(() => {
            this.loading = false;
            this.projectFormInitialValue = this.projectForm.value;
          })
        )
        .subscribe((next) => {
          this.projectForm.valueChanges.subscribe((change) => {
            this.projectForm.setErrors(
              _.isEqual(next, change) ? { identical: true } : null
            );
          });
        });

      if (this.formMode == 'details') {
        const controls = this.projectForm.controls;
        for (const key in controls) {
          controls[key].disable();
        }
      }
    }
  }

  /**
   * Método para inicialização do formulário.
   *
   */
  initForm() {
    this.projectForm = this._formFactory.generateForm(this.projectCreateObject);
  }

  /**
   * Método para cancelar o preenchimento do formulário.
   * Envia o usuário para a página de listagem de projetos
   *
   */
  cancelForm() {
    this._router.navigate(['main', 'projects']);
  }

  /**
   * Método para enviar o formulário. Verifica o formMode e chama o método apropriado
   * do serviço ProjetosService.
   *
   * @param form - O `FormGroup` do formulário
   *
   */
  submitProjectForm(form: FormGroup) {
    if (form.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    //TODO: Tratamento de erro (caso sigla duplicada)
    switch (this.formMode) {
      case 'create':
        const createPayload = form.value as ProjectCreate;

        this._projetosService
          .postProjetos(createPayload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Projeto cadastrado com sucesso.');
              this._router.navigate(['main', 'projects']);
            }
          });
        break;

      case 'edit':
        // Retorna um objeto que contém somente os valores alterados.
        const editPayload = _.pickBy(form.value, (value, key) => {
          return (
            value !=
            this.projectFormInitialValue[
              key as keyof typeof this.projectFormInitialValue
            ]
          );
        }) as ProjectEdit;

        this._projetosService
          .putProjeto(this.projectEditId, editPayload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Projeto alterado com sucesso.');
              this._router.navigate(['main', 'projects']);
            }
          });
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._microrregioes$.unsubscribe();
    this._entidades$.unsubscribe();
  }
}
