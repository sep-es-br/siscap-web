import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, concat, finalize, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../core/components/modal/delete-modal/delete-modal.component';

import { ProfileService } from '../../../shared/services/profile/profile.service';
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
import { ArrayItemNumberToStringMapper } from '../../../shared/utils/array-item-mapper';

import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

@Component({
  selector: 'siscap-project-form',
  standalone: false,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  private _getOrganizacoes$!: Observable<ISelectList[]>;
  private _getPessoas$!: Observable<ISelectList[]>;
  private _getPlanos$!: Observable<ISelectList[]>;
  private _getMicrorregioes$!: Observable<ISelectList[]>;
  private _getAllSelectLists$!: Observable<ISelectList[]>;

  private _getProjetoById$!: Observable<IProject>;

  private _subscription: Subscription = new Subscription();
  public loading: boolean = true;

  public formMode!: string;
  public isEdit!: boolean;

  public projectForm!: FormGroup;

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
    private _profileService: ProfileService,
    private _projetosService: ProjetosService,
    private _selectListService: SelectListService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.projectEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._subscription.add(this._breadcrumbService.breadcrumbAction.subscribe((actionType: string) => {
      this.handleActionBreadcrumb(actionType);
    }));


    this._getProjetoById$ = this._projetosService
      .getProjetoById(this.projectEditId)
      .pipe(
        tap((response) => {
          this.initForm(response);
        }),
        finalize(() => {
          this.projectFormInitialValue = this.projectForm.value;

          this.switchMode(false);

          this.loading = false;
        })
      );

    this._getOrganizacoes$ = this._selectListService.getOrganizacoes().pipe(
      tap((response) => {
        this.organizacoesList = response;
      })
    );

    this._getPessoas$ = this._selectListService.getPessoas().pipe(
      tap((response) => {
        this.pessoasList = response;
      })
    );

    this._getPlanos$ = this._selectListService.getPlanos().pipe(
      tap((response) => {
        this.planosList = response;
      })
    );

    this._getMicrorregioes$ = this._selectListService.getMicrorregioes().pipe(
      tap((response) => {
        this.microrregioesList = response;
      })
    );

    this._getAllSelectLists$ = concat(
      this._getOrganizacoes$,
      this._getPessoas$,
      this._getPlanos$,
      this._getMicrorregioes$
    );
  }

  /**
   * @private
   * Método para inicialização do formulário. Popula valor inicial dos controles com valor original do projeto, caso houver.
   * Se não, inicial com controles vazios.
   *
   * @param {IProject} project - Valor inicial do projeto.
   */
  private initForm(project?: IProject) {
    const nnfb = this._formBuilder.nonNullable;
    this.projectForm = nnfb.group({
      sigla: nnfb.control(project?.sigla ?? '', {
        validators: [Validators.required, Validators.maxLength(12)],
      }),
      titulo: nnfb.control(project?.titulo ?? '', {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      idOrganizacao: nnfb.control(project?.idOrganizacao?.toString() ?? null, {
        validators: Validators.required,
      }),
      valorEstimado: nnfb.control(project?.valorEstimado ?? null, {
        validators: [Validators.required, Validators.min(1)],
      }),
      idMicrorregioes: nnfb.control(
        ArrayItemNumberToStringMapper(project?.idMicrorregioes) ?? [],
        {
          validators: Validators.required,
        }
      ),
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
      idPessoasEquipeElab: nnfb.control(
        ArrayItemNumberToStringMapper(project?.idPessoasEquipeElab) ?? [],
        {
          validators: Validators.required,
        }
      ),
      //AInda não implementados
      plano: nnfb.control({ value: null, disabled: true }),
      eixo: nnfb.control({ value: null, disabled: true }),
      area: nnfb.control({ value: null, disabled: true }),
    });
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    if (this.formMode == 'criar') {
      this.initForm();
      this.loading = false;
      return;
    }

    this._subscription.add(this._getProjetoById$.subscribe());
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  /**
   * @public
   * Adiciona todos os valores de um componente `ng-select` ao controle associado.
   *
   *
   * @param event - O evento de output do componente. Utilizado para capturar a label da opção.
   * @param {string} controlName - Nome do controle associado
   * @param {Array<ISelectList>} list - O array de valores do controle
   */
  public ngSelectAddAll(
    event: any,
    controlName: string,
    list: Array<ISelectList>
  ) {
    if (event['$ngOptionLabel'] == 'Todas') {
      const control = this.projectForm.get(controlName);
      const allValues = list.map((item) => item.id);
      control?.patchValue(allValues);
    }
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  public switchMode(isEnabled: boolean, excluded?: Array<string>) {
    this.isEdit = isEnabled;

    const controls = this.projectForm.controls;
    for (const key in controls) {
      !excluded?.includes(key) && isEnabled
        ? controls[key].enable()
        : controls[key].disable();
    }
  }

  /**
   * @public
   * Método para cancelar o preenchimento do formulário.
   * Envia o usuário para a página de listagem de projetos
   *
   */
  public cancelForm() {
    this._router.navigate(['main', 'projetos']);
  }

  /**
   * @public
   * Método para enviar o formulário. Verifica o `formMode` e chama o método apropriado
   * do serviço `ProjetosService`.
   *
   * @param form - O `FormGroup` do formulário
   *
   */
  public submitProjectForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

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

  /**
   * @public
   * Método para deletar o projeto. Chama um modal e ao confirmar, chama requisição para deletar.
   *
   * @param {number} id - O id do projeto á ser deletado.
   */
  public deletarProjeto(id: number) {
    const deleteModalRef = this._modalService.open(DeleteModalComponent);
    deleteModalRef.componentInstance.title = 'Atenção!';
    deleteModalRef.componentInstance.content =
      'O projeto será excluído. Tem certeza que deseja prosseguir?';

    deleteModalRef.result.then(
      (resolve) => {
        this._projetosService
          .deleteProjeto(id)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Projeto excluído com sucesso.'
                );
                this._router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => this._router.navigateByUrl('main/projetos'));
              }
            })
          )
          .subscribe();
      },
      (reject) => { }
    );
  }



  public handleActionBreadcrumb(actionType: string) {
    console.log(actionType);
    console.log('PROJETO');
    switch (actionType) {
      case 'edit':
        if(this.isAllowed('projetoseditar')){
          this.switchMode(true, ['idProjetos']);
        }
        break;

      case 'delete':
        if(this.isAllowed('projetosedeletar')){
          this.deletarProjeto(this.projectEditId );
        }
        break;

      case 'cancel':
        this.cancelForm();
        break;

      case 'save':
        this.submitProjectForm(this.projectForm);
        break;
    }
  }
  

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  downloadDic(id: number): void {
    this._projetosService.downloadDIC(id);
  }

}
