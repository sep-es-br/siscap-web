import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Observable,
  Subscription,
  concat,
  debounceTime,
  finalize,
  tap,
} from 'rxjs';

import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import { ProjetosFormService } from '../../../shared/services/projetos/projetos-form.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';

import {
  IProjeto,
  IProjetoForm,
} from '../../../shared/interfaces/projeto.interface';
import {
  IMicrorregiaoCidadesSelectList,
  ISelectList,
} from '../../../shared/interfaces/select-list.interface';

import { ProjetoFormModel } from '../../../shared/models/projeto.model';
import { EquipeFormModel } from '../../../shared/models/equipe.model';
import { RateioService } from '../../../shared/services/projetos/rateio.service';
import { RateioFormModel } from '../../../shared/models/rateio.model';

@Component({
  selector: 'siscap-project-form',
  standalone: false,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private _getOrganizacoes$!: Observable<ISelectList[]>;
  private _getPessoas$!: Observable<ISelectList[]>;
  private _getPlanos$!: Observable<ISelectList[]>;
  // private _getMicrorregioes$!: Observable<ISelectList[]>;
  private _getMicrorregioesCidades$!: Observable<
    IMicrorregiaoCidadesSelectList[]
  >;
  private _getPapeis$!: Observable<ISelectList[]>;

  private _getAllSelectLists$!: Observable<ISelectList[]>;

  private _getProjetoById$!: Observable<IProjeto>;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;

  public formMode!: string;
  public isEdit: boolean = true;

  public projectForm!: FormGroup;
  public projectEditId!: number;

  public equipeElaboracaoNgSelectValue: string | null = null;

  // public microrregioesList: ISelectList[] = [];
  public organizacoesList: ISelectList[] = [];
  public pessoasList: ISelectList[] = [];
  public planosList: ISelectList[] = [];
  public microrregioesCidadesList: IMicrorregiaoCidadesSelectList[] = [];
  public papeisList: ISelectList[] = [];

  public equipeElaboracaoList: ISelectList[] = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileService,
    private _projetosService: ProjetosService,
    private _projetosFormService: ProjetosFormService,
    public rateioService: RateioService,
    private _selectListService: SelectListService,
    private _pessoasService: PessoasService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.projectEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._getProjetoById$ = this._projetosService
      .getProjetoById(this.projectEditId)
      .pipe(
        tap((response: IProjeto) => this.patchForm(response)),
        finalize(() => this.switchMode(false))
      );

    this._getOrganizacoes$ = this._selectListService
      .getOrganizacoes()
      .pipe(tap((response) => (this.organizacoesList = response)));

    this._getPessoas$ = this._selectListService.getPessoas().pipe(
      tap((response) => (this.pessoasList = response)),
      finalize(() =>
        this.filterResponsavelProponenteFromEquipeElaboracaoList(
          this._projetosFormService.idResponsavelProponente.value
        )
      )
    );

    this._getPlanos$ = this._selectListService
      .getPlanos()
      .pipe(tap((response) => (this.planosList = response)));

    // this._getMicrorregioes$ = this._selectListService
    //   .getMicrorregioes()
    //   .pipe(tap((response) => (this.microrregioesList = response)));

    this._getMicrorregioesCidades$ = this._selectListService
      .getMicrorregioesCidades()
      .pipe(tap((response) => (this.microrregioesCidadesList = response)));

    this._getPapeis$ = this._selectListService
      .getPapeis()
      .pipe(tap((response) => (this.papeisList = response)));

    this._getAllSelectLists$ = concat(
      this._getOrganizacoes$,
      this._getPessoas$,
      this._getPlanos$,
      // this._getMicrorregioes$,
      this._getPapeis$,
      this._getMicrorregioesCidades$
    );

    this._subscription.add(
      this._breadcrumbService
        .handleAction(this.handleActionBreadcrumb.bind(this))
        .subscribe()
    );
  }

  /**
   * @private
   * Método para inicialização do formulário. Popula valor inicial dos controles com valor original do projeto, caso houver.
   * Se não, inicial com controles vazios.
   *
   * @param {IProjeto} projeto - Valor inicial do projeto.
   */
  private initForm(projeto: ProjetoFormModel): void {
    this.projectForm = this._projetosFormService.buildProjetoForm(projeto);

    this.rateioService.setRateioFormArray(
      this.projectForm.get('rateio') as FormArray<FormGroup<RateioFormModel>>
    );
  }

  private patchForm(projeto: IProjeto) {
    this.projectForm.patchValue(projeto, { emitEvent: false });

    projeto.equipeElaboracao.forEach((member) => {
      const newMember = this._projetosFormService.buildMemberFormGroup(
        member.idPessoa,
        member.idPapel
      );

      this._projetosFormService.equipeElaboracao.push(newMember);
    });

    this.filterResponsavelProponenteFromEquipeElaboracaoList(
      this._projetosFormService.idResponsavelProponente.value
    );
  }

  public getControl(controlName: string): AbstractControl<any, any> | null {
    return this._projetosFormService.getControl(controlName);
  }

  get equipeElaboracao(): FormArray<FormGroup<EquipeFormModel>> {
    return this._projetosFormService.equipeElaboracao;
  }

  get rateio(): FormArray<FormGroup<RateioFormModel>> {
    return this._projetosFormService.rateio;
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    this.initForm(new ProjetoFormModel());

    this.loading = false;

    if (this.formMode == 'editar') {
      this._subscription.add(this._getProjetoById$.subscribe());
    }
  }

  ngAfterContentInit(): void {
    this._projetosFormService.idOrganizacao.valueChanges.subscribe((value) => {
      if (this.formMode == 'criar' || this.isEdit) {
        this.organizationChanged(value);
      }
    });

    this._projetosFormService.idResponsavelProponente.valueChanges.subscribe(
      (value) => {
        if (this.formMode == 'criar' || this.isEdit) {
          this.equipeElaboracaoList = this.pessoasList.filter(
            (pessoa) => pessoa.id != value
          );
          this.filterResponsavelProponenteFromEquipeElaboracaoList(value);
          if (
            this.equipeElaboracao.length > 0 &&
            this._projetosFormService.idResponsavelProponente.dirty
          ) {
            this._toastService.showToast(
              'info',
              'Responsável proponente alterado',
              ['Limpando membros da equipe']
            );
          }
        }
      }
    );

    this._projetosFormService.valorEstimado.valueChanges.subscribe((value) => {
      this.rateioService.valorEstimadoReferenciaObs$.next(value);
    });
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

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

  public organizationChanged(orgId: number | null): void {
    const idResponsavelProponenteControl =
      this._projetosFormService.idResponsavelProponente;

    if (!orgId) {
      idResponsavelProponenteControl.patchValue(null);
      return;
    }

    this._pessoasService.getResponsavelByOrganizacaoId(orgId).subscribe({
      next: (response: ISelectList) => {
        idResponsavelProponenteControl.patchValue(response.id);
      },
      error: (err) => {
        this._toastService.toastNotifier$.subscribe((value) => {
          if (!value) this.cancelForm();
        });
      },
    });
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  public switchMode(isEnabled: boolean, excluded?: Array<string>): void {
    this.isEdit = isEnabled;

    const controls = this.projectForm.controls;
    for (const key in controls) {
      !excluded?.includes(key) && isEnabled
        ? controls[key].enable({ emitEvent: false })
        : controls[key].disable({ emitEvent: false });
    }
  }

  /**
   * @public
   * Método para cancelar o preenchimento do formulário.
   * Envia o usuário para a página de listagem de projetos
   *
   */
  public cancelForm(): void {
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
  public submitProjectForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    console.log(form.value);

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    // switch (this.formMode) {
    //   case 'criar': {
    //     const createPayload = form.value as IProjetoForm;

    //     this._projetosService
    //       .postProjeto(createPayload)
    //       .pipe(
    //         tap((response) => {
    //           if (response) {
    //             this._toastService.showToast(
    //               'success',
    //               'Projeto cadastrado com sucesso.'
    //             );
    //             this._router.navigateByUrl('main/projetos');
    //           }
    //         })
    //       )
    //       .subscribe();
    //     break;
    //   }
    //   case 'editar': {
    //     const editPayload = form.value as IProjetoForm;

    //     this._projetosService
    //       .putProjeto(this.projectEditId, editPayload)
    //       .pipe(
    //         tap((response) => {
    //           if (response) {
    //             this._toastService.showToast(
    //               'success',
    //               'Projeto alterado com sucesso.'
    //             );
    //             this._router.navigateByUrl('main/projetos');
    //           }
    //         })
    //       )
    //       .subscribe();

    //     break;
    //   }
    //   default:
    //     break;
    // }
  }

  private handleActionBreadcrumb(actionType: string) {
    switch (actionType) {
      case 'edit':
        if (this.isAllowed('projetoseditar')) {
          this.switchMode(true, ['idProjetos']);
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

  private filterResponsavelProponenteFromEquipeElaboracaoList(
    idResponsavelProponente: number | null
  ): void {
    this.equipeElaboracaoList = this.pessoasList.filter(
      (pessoa) => pessoa.id != idResponsavelProponente
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  downloadDic(id: number): void {
    this._projetosService.downloadDIC(id);
  }
}
