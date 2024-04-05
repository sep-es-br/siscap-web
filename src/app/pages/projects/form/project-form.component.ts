import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, finalize, first, tap } from 'rxjs';

import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import {
  IProject,
  IProjectCreate,
  IProjectEdit,
} from '../../../shared/interfaces/project.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';

@Component({
  selector: 'siscap-project-form',
  standalone: false,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent implements OnInit {
  public projectForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  private _prepareForm$!: Observable<IProject>;
  public projectEditId!: number;
  public projectFormInitialValue!: IProjectCreate;

  public microrregioesList: ISelectList[] = [];
  public organizacoesList: ISelectList[] = [];
  public planosList: ISelectList[] = [];
  public pessoasList: ISelectList[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService,
    private _selectListService: SelectListService,
    private _toastService: ToastService
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
      .getOrganizacoes()
      .pipe(
        first(),
        tap((response) => {
          this.organizacoesList = response;
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

  rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  ngSelectAddAll(event: any, controlName: string, list: Array<ISelectList>) {
    if (event['$ngOptionLabel'] == 'Todas') {
      const control = this.projectForm.get(controlName);
      const allValues = list.map((item) => item.id);
      control?.patchValue(allValues);
    }
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
      idOrganizacao: nnfb.control(project?.idOrganizacao ?? null, {
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
      //AInda não implementados
      plano: nnfb.control({ value: null, disabled: true }),
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
      return;
    }

    //TODO: Tratamento de erro (caso sigla duplicada)
    switch (this.formMode) {
      case 'criar':
        const createPayload = form.value as IProjectCreate;

        this._projetosService
          .postProjeto(createPayload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Projeto cadastrado com sucesso.'
                );
                this._router.navigateByUrl('main/projetos');
              }
            })
          )
          .subscribe();
        break;

      case 'editar':
        const editPayload = form.value as IProjectEdit;

        this._projetosService
          .putProjeto(this.projectEditId, editPayload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Projeto alterado com sucesso.'
                );
                this._router.navigateByUrl('main/projetos');
              }
            })
          )
          .subscribe();

        break;

      default:
        break;
    }
  }
}
