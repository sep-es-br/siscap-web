import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, concat, finalize, tap } from 'rxjs';

import { ProjetosService } from '../../../shared/services/projetos/projetos.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { EquipeService } from '../../../shared/services/equipe/equipe.service';
import { RateioService } from '../../../shared/services/rateio/rateio.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';

import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';
import { construirMicrorregioesCidadesMapObject } from '../../../shared/helpers/rateio/microrregioes-cidades-map-object.helper';
import { rateioValidator } from '../../../shared/helpers/rateio/rateio-validator';

import { IProjeto } from '../../../shared/interfaces/projeto.interface';
import {
  ICidadeSelectList,
  ISelectList,
} from '../../../shared/interfaces/select-list.interface';

import {
  ProjetoFormModel,
  ProjetoModel,
} from '../../../shared/models/projeto.model';

import { RateioFormType } from '../../../shared/types/form/rateio-form.type';

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
  private _getCidadesComMicrorregiao$!: Observable<ICidadeSelectList[]>;
  private _getPapeis$!: Observable<ISelectList[]>;

  private _getAllSelectLists$!: Observable<ISelectList[]>;

  private _getProjetoById$!: Observable<IProjeto>;

  private _subscription: Subscription = new Subscription();

  private _projetoEditId: number = 0;

  public loading: boolean = true;

  public formMode!: string;
  public isEdit: boolean = true;

  public projetoForm: FormGroup = new FormGroup({});

  public organizacoesList: ISelectList[] = [];
  public pessoasList: ISelectList[] = [];
  public pessoasListFilrada: ISelectList[] = [];
  public planosList: ISelectList[] = [];
  public microrregioesList: ISelectList[] = [];
  public cidadesComMicrorregiaoList: ICidadeSelectList[] = [];

  public papeisList: ISelectList[] = [];

  public idMembroEquipeElaboracao: number | null = null;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _nnfb: NonNullableFormBuilder,
    private _profileService: ProfileService,
    private _projetosService: ProjetosService,
    public equipeService: EquipeService,
    private _rateioService: RateioService,
    private _selectListService: SelectListService,
    private _pessoasService: PessoasService,
    private _toastService: ToastService,
    private _breadcrumbService: BreadcrumbService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this._projetoEditId = Number(
      this._route.snapshot.queryParams['id'] ?? null
    );

    this._getProjetoById$ = this._projetosService
      .getProjetoById(this._projetoEditId)
      .pipe(
        tap((response: IProjeto) =>
          this.iniciarForm(new ProjetoModel(response))
        ),
        finalize(() => {
          this.switchMode(false);
          this.loading = false;
        })
      );

    this._getOrganizacoes$ = this._selectListService
      .getOrganizacoes()
      .pipe(tap((response) => (this.organizacoesList = response)));

    this._getPessoas$ = this._selectListService
      .getPessoas()
      .pipe(
        tap(
          (response) => (this.pessoasListFilrada = this.pessoasList = response)
        )
      );

    this._getPlanos$ = this._selectListService
      .getPlanos()
      .pipe(tap((response) => (this.planosList = response)));

    this._getMicrorregioes$ = this._selectListService
      .getMicrorregioes()
      .pipe(tap((response) => (this.microrregioesList = response)));

    this._getCidadesComMicrorregiao$ = this._selectListService
      .getCidadesComMicrorregiao()
      .pipe(tap((response) => (this.cidadesComMicrorregiaoList = response)));

    this._getPapeis$ = this._selectListService
      .getPapeis()
      .pipe(tap((response) => (this.papeisList = response)));

    this._getAllSelectLists$ = concat(
      this._getOrganizacoes$,
      this._getPessoas$,
      this._getPlanos$,
      this._getPapeis$,
      this._getMicrorregioes$,
      this._getCidadesComMicrorregiao$
    ).pipe(
      finalize(() => {
        this._rateioService.microrregioesCidadesMapObject =
          construirMicrorregioesCidadesMapObject(
            this.microrregioesList,
            this.cidadesComMicrorregiaoList
          );
      })
    );

    this._subscription.add(
      this._breadcrumbService
        .handleAction(this.handleActionBreadcrumb.bind(this))
        .subscribe()
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    if (this.formMode === 'criar') {
      this.iniciarForm();
      this.loading = false;
      return;
    }

    this._subscription.add(this._getProjetoById$.subscribe());
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.projetoForm.get(controlName) as AbstractControl<any, any>;
  }

  public filtrarResponsavelProponente(
    pessoasList: ISelectList[]
  ): ISelectList[] {
    return pessoasList.filter(
      (pessoa) =>
        pessoa.id != this.projetoForm.get('idResponsavelProponente')?.value
    );
  }

  public idMembroNgSelectChangeEvent(event: number): void {
    this.equipeService.idMembroNgSelectValue$.next(event);

    setTimeout(() => (this.idMembroEquipeElaboracao = null), 0);
  }

  public downloadDic(): void {
    this._projetosService.downloadDIC(this._projetoEditId);
  }

  private iniciarForm(projetoFormModel?: ProjetoFormModel): void {
    this.projetoForm = this._nnfb.group({
      sigla: this._nnfb.control(projetoFormModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(projetoFormModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idOrganizacao: this._nnfb.control(
        projetoFormModel?.idOrganizacao ?? null,
        Validators.required
      ),
      valorEstimado: this._nnfb.control(
        projetoFormModel?.valorEstimado ?? null,
        [Validators.required, Validators.min(1)]
      ),
      rateio: this._nnfb.group(
        {
          rateioMicrorregiao:
            this._rateioService.construirRateioMicrorregiaoFormArray(
              projetoFormModel?.rateio.rateioMicrorregiao
            ),
          rateioCidade: this._rateioService.construirRateioCidadeFormArray(
            projetoFormModel?.rateio.rateioCidade
          ),
        },
        { validators: Validators.required }
      ),
      objetivo: this._nnfb.control(projetoFormModel?.objetivo ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      objetivoEspecifico: this._nnfb.control(
        projetoFormModel?.objetivoEspecifico ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      situacaoProblema: this._nnfb.control(
        projetoFormModel?.situacaoProblema ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      solucoesPropostas: this._nnfb.control(
        projetoFormModel?.solucoesPropostas ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      impactos: this._nnfb.control(projetoFormModel?.impactos ?? null, [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      arranjosInstitucionais: this._nnfb.control(
        projetoFormModel?.arranjosInstitucionais ?? null,
        [Validators.required, Validators.maxLength(2000)]
      ),
      idResponsavelProponente: this._nnfb.control(
        projetoFormModel?.idResponsavelProponente ?? null,
        Validators.required
      ),
      equipeElaboracao: this.equipeService.construirEquipeFormArray(
        projetoFormModel?.equipeElaboracao
      ),
    });

    this.projetoFormValueChanges();
  }

  private projetoFormValueChanges(): void {
    const idOrganizacaoFormControl = this.projetoForm.get(
      'idOrganizacao'
    ) as FormControl<number | null>;

    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    const valorEstimadoFormControl = this.projetoForm.get(
      'valorEstimado'
    ) as FormControl<number | null>;

    const rateioFormGroup = this.projetoForm.get(
      'rateio'
    ) as FormGroup<RateioFormType>;

    idOrganizacaoFormControl.valueChanges.subscribe((idOrganizacaoValue) => {
      if (this.formMode == 'criar' || this.isEdit) {
        this.idOrganizacaoChange(idOrganizacaoValue);
      }
    });

    idResponsavelProponenteFormControl.valueChanges.subscribe(
      (idResponsavelProponenteValue) => {
        if (
          this.equipeService.equipeFormArray.length > 0 &&
          idResponsavelProponenteFormControl.dirty
        ) {
          this._toastService.showToast(
            'info',
            'Responsável proponente alterado',
            ['Limpando membros da equipe']
          );

          this.equipeService.equipeFormArray.clear();
        }
      }
    );

    valorEstimadoFormControl.valueChanges.subscribe((valorEstimadoValue) => {
      this._rateioService.valorEstimadoReferencia$.next(valorEstimadoValue);

      rateioFormGroup.setErrors(
        rateioValidator(valorEstimadoValue, rateioFormGroup.value)
      );
    });

    rateioFormGroup.valueChanges.subscribe((rateioFormGroupValue) => {
      rateioFormGroup.setErrors(
        rateioValidator(valorEstimadoFormControl.value, rateioFormGroupValue)
      );
    });
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
        this.submitProjetoForm(this.projetoForm);
        break;
    }
  }

  private idOrganizacaoChange(idOrganizacaoValue: number | null): void {
    const idResponsavelProponenteFormControl = this.projetoForm.get(
      'idResponsavelProponente'
    ) as FormControl<number | null>;

    if (!idOrganizacaoValue) {
      idResponsavelProponenteFormControl.patchValue(null);
      return;
    }

    this._pessoasService
      .getResponsavelByOrganizacaoId(idOrganizacaoValue)
      .subscribe({
        next: (response: ISelectList) => {
          idResponsavelProponenteFormControl.patchValue(response.id);
        },
        error: (err) => {
          idResponsavelProponenteFormControl.patchValue(null);
          idResponsavelProponenteFormControl.markAsTouched();
        },
      });
  }

  private isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  private switchMode(isEnabled: boolean, excluded?: Array<string>): void {
    this.isEdit = isEnabled;

    const controls = this.projetoForm.controls;
    for (const key in controls) {
      !excluded?.includes(key) && isEnabled
        ? controls[key].enable()
        : controls[key].disable({ emitEvent: false });
    }
  }

  private cancelForm(): void {
    this._router.navigate(['main', 'projetos']);
  }

  private submitProjetoForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new ProjetoFormModel(form.value);

    switch (this.formMode) {
      case 'criar': {
        this._projetosService
          .postProjeto(payload)
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
      }
      case 'editar': {
        this._projetosService
          .putProjeto(this._projetoEditId, payload)
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
      }
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._rateioService.limparTotalRateio();
  }
}
