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
import { ActivatedRoute, Params } from '@angular/router';
import { IProjectCreate } from '../../../shared/interfaces/projectCreate.interface';

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
  public projectFormInitialValue!: any;

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
    private _route: ActivatedRoute
  ) {
    this._route.queryParams.subscribe((params: Params) => {
      this.isEdit = params['isEdit'] ? params['isEdit'] : false;
      this.projectEditId = params['id'] ? params['id'] : null;
    });

    this._microrregioes$ = this._microrregiaoService
      .getMicrorregioes()
      .pipe(first())
      .subscribe((data) => {
        this.microrregioesList = data;
      });

    this._entidades$ = this._entidadeService
      .getEntidades()
      .pipe(first())
      .subscribe((data) => {
        this.entidadesList = data;
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
   * @param {FormGroup} payload - O `FormGroup` do formulário.
   *
   */
  submitProjectCreateForm(payload: FormGroup) {
    if (payload.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    //TODO: Tratamento de erro (caso sigla duplicada)
    this._projetos$ = this._projetosService
      .postProjetos(payload.value)
      .subscribe((response) => {
        console.log(response);
        if (response.status == 201) {
          alert('Projeto cadastrado com sucesso.');
          window.history.go(-1);
        }
      });
  }

  submitProjectEditForm(payload: FormGroup) {
    if (payload.invalid) {
      alert('Formulário contém erros. Por favor verificar os campos.');
      return;
    }

    let payloadEditValues: Partial<IProjectCreate> = {};

    // console.log(this.projectFormInitialValue);
    // console.log(payload.value);

    Object.keys(payload.value).forEach((key) => {
      if (this.projectFormInitialValue[key] != payload.value[key]) {
        console.log(key);
        console.log(payload.value[key]);
        Object.defineProperty(payloadEditValues, key, payload.value);
      }
    });

    //TODO: Tratamento de erro (caso sigla duplicada)
    // this._projetos$ = this._projetosService
    //   .putProjeto(this.projectEditId, payload.value)
    //   .subscribe((response) => {
    //     console.log(response);
    //     if (response.status == 201) {
    //       alert('Projeto cadastrado com sucesso.');
    //       window.history.go(-1);
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this._microrregioes$.unsubscribe();
    this._entidades$.unsubscribe();
  }
}
