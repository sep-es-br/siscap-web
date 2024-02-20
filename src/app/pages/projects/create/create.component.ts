import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subscription, first } from 'rxjs';

import { projectCreateModel } from '../../../shared/models/projectCreate.model';
import { FormFactoryService } from '../../../shared/services/form-factory/form-factory.service';
import { MicrorregiaoService } from '../../../shared/services/microrregiao/microrregiao.service';
import { IMicrorregiao } from '../../../shared/interfaces/microrregiao.interface';
import { EntidadeService } from '../../../shared/services/entidade/entidade.service';
import { IEntidade } from '../../../shared/interfaces/entidade.interface';
import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  ProjectCreate,
  ProjectEdit,
} from '../../../shared/interfaces/project.interface';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent implements OnInit, OnDestroy {
  public projectForm!: FormGroup;

  public loading: boolean = false;

  public isEdit: boolean = false;
  public projectEditId!: number;
  public projectFormInitialValue!: ProjectCreate;

  private _microrregioes$!: Subscription;
  private _entidades$!: Subscription;

  public microrregioesList: IMicrorregiao[] = [];
  public entidadesList: IEntidade[] = [];

  private _projetos$!: Subscription;

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
      initialValue: 0,
      validators: {
        required: true,
        min: 0,
      },
    },
    valorEstimado: {
      initialValue: 0,
      validators: {
        required: true,
        min: 0,
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
    private _microrregiaoService: MicrorregiaoService,
    private _entidadeService: EntidadeService,
    private _projetosService: ProjetosService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._route.queryParams.subscribe((params: Params) => {
      this.isEdit = params['isEdit'] ? params['isEdit'] : false;
      this.projectEditId = params['id'] ? params['id'] : null;
    });

    this._microrregioes$ = this._microrregiaoService
      .getMicrorregioes()
      .pipe(first())
      .subscribe((response) => {
        this.microrregioesList = response;
      });

    this._entidades$ = this._entidadeService
      .getEntidades()
      .pipe(first())
      .subscribe((response) => {
        this.entidadesList = response;
      });
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.loading = true;

      this._projetos$ = this._projetosService
        .getProjetosById(this.projectEditId)
        .pipe(first())
        .subscribe((response) => {
          for (const key in this.projectCreateObject) {
            if (
              Object.prototype.hasOwnProperty.call(
                this.projectCreateObject,
                key
              )
            ) {
              const typedKey = key as keyof typeof this.projectCreateObject;
              this.projectCreateObject[typedKey]['initialValue'] =
                response[typedKey];
            }
          }

          this.initForm();
          this.projectFormInitialValue = this.projectForm.value;

          this.loading = false;
        });
    } else {
      this.initForm();
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
   * Método para limpar o formulário.
   *
   */
  resetForm() {
    if (
      confirm(
        'O formulário será resetado para as configurações iniciais. Prosseguir?'
      )
    ) {
      this.initForm();
    }
  }

  /**
   * Método para acessar os controles primariamente no template HTML do componente.
   *
   * @param {string} control - O nome do controle contido no objeto modelo, registrado através do FormFactoryService.
   *
   * @returns - O controle `AbstractControl`
   */
  getControl(control: string) {
    return this.projectForm.get(control);
  }

  /**
   * Método para criar um novo projeto no banco de dados.
   *
   * @param {FormGroup} form - O `FormGroup` do formulário.
   *
   */
  submitProjectCreateForm(form: FormGroup) {
    if (form.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    //TODO: Tratamento de erro (caso sigla duplicada)
    const payload = form.value as ProjectCreate;
    this._projetos$ = this._projetosService
      .postProjetos(payload)
      .subscribe((response) => {
        console.log(response);
        if (response) {
          alert('Projeto cadastrado com sucesso.');
          this._router.navigate(['projects']);
        }
        // if (response.status == 201) {
        //   alert('Projeto cadastrado com sucesso.');
        //   window.history.go(-1); //trocar por router.navigate()
        // }
      });
  }

  /**
   * Método para editar um projeto já existente no banco de dados.
   *
   * @param {FormGroup} form - O `FormGroup` do formulário.
   *
   */
  submitProjectEditForm(form: FormGroup) {
    if (form.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    /*
    Laço for in para percorrer as chaves do valor inicial do formulario.
    Caso algum controle tenha seu valor alterado, o valor do formulario é alterado.
    Caso não, o controle é removido.
    */
    for (const key in this.projectFormInitialValue) {
      const typedKey = key as keyof ProjectCreate;
      if (
        Object.prototype.hasOwnProperty.call(this.projectFormInitialValue, key)
      ) {
        if (form.value[typedKey] !== this.projectFormInitialValue[typedKey]) {
          form.patchValue({ [key]: form.value[key] });
        } else {
          form.removeControl(typedKey);
        }
      }
    }

    const payload = form.value as ProjectEdit;

    this._projetos$ = this._projetosService
      .putProjeto(this.projectEditId, payload)
      .subscribe((response) => {
        console.log(response);
        if (response) {
          alert('Projeto alterado com sucesso.');
          this._router.navigate(['projects']);
        }
        // if (response.status == 200) {
        //   alert('Projeto atualizado com sucesso.');
        //   window.history.go(-1);
        // }
      });
  }

  ngOnDestroy(): void {
    this._microrregioes$.unsubscribe();
    this._entidades$.unsubscribe();
  }
}
