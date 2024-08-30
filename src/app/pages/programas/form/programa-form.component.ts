import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  IPrograma,
  IProgramaProjetoProposto,
} from '../../../shared/interfaces/programa.interface';
import { EquipeService } from '../../../shared/services/equipe/equipe.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { concat, finalize, Observable, Subscription, tap } from 'rxjs';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';
import { BreadcrumbService } from '../../../shared/services/breadcrumb/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { NgxMaskTransformFunctionHelper } from '../../../shared/helpers/ngx-mask-transform-function.helper';
import { MoedaHelper } from '../../../shared/helpers/moeda.helper';
import {
  ProgramaFormModel,
  ProgramaModel,
} from '../../../shared/models/programa.model';
import { ProgramasService } from '../../../shared/services/programas/programas.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { IMoeda } from '../../../shared/interfaces/moeda.interface';
import { ProgramaProjetoPropostoFormType } from '../../../shared/types/form/programa-projeto-proposto-form.type';

@Component({
  selector: 'siscap-programa-form',
  standalone: false,
  templateUrl: './programa-form.component.html',
  styleUrl: './programa-form.component.scss',
})
export class ProgramaFormComponent implements OnInit, OnDestroy {
  private _getProgramaById$!: Observable<IPrograma>;
  private _getOrganizacoes$!: Observable<ISelectList[]>;
  private _getPessoas$!: Observable<ISelectList[]>;
  private _getPapeis$!: Observable<ISelectList[]>;
  private _getProjetosSelectList$!: Observable<ISelectList[]>;
  private _getValores$!: Observable<ISelectList[]>;

  private _getAllSelectLists$!: Observable<ISelectList[]>;

  private _subscription: Subscription = new Subscription();

  private _programaEditId: number = 0;

  public loading: boolean = true;

  public programaForm: FormGroup = new FormGroup({});

  public formMode: string = '';
  public isEdit: boolean = true;

  public organizacoesList: ISelectList[] = [];
  public pessoasList: ISelectList[] = [];
  public papeisList: ISelectList[] = [];
  public projetosSelectList: ISelectList[] = [];
  public moedasList: Array<IMoeda> = MoedaHelper.moedasList();
  public valoresList: ISelectList[] = [];

  public idMembroEquipeCaptacao: number | null = null;
  public idProjetoProposto: number | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _nnfb: NonNullableFormBuilder,
    public equipeService: EquipeService,
    private _programasService: ProgramasService,
    private _selectListService: SelectListService,
    private _breadcrumbService: BreadcrumbService,
    private _profileService: ProfileService,
    private _toastService: ToastService
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this._programaEditId = Number(
      this._route.snapshot.queryParams['id'] ?? null
    );

    this._getProgramaById$ = this._programasService
      .getProgramaById(this._programaEditId)
      .pipe(
        tap((response: IPrograma) =>
          this.iniciarForm(new ProgramaModel(response))
        ),
        finalize(() => {
          this.switchMode(false);
          this.loading = false;
        })
      );

    this._getOrganizacoes$ = this._selectListService
      .getOrganizacoes()
      .pipe(
        tap((response: ISelectList[]) => (this.organizacoesList = response))
      );

    this._getPessoas$ = this._selectListService
      .getPessoas()
      .pipe(tap((response: ISelectList[]) => (this.pessoasList = response)));

    this._getPapeis$ = this._selectListService
      .getPapeis()
      .pipe(tap((response: ISelectList[]) => (this.papeisList = response)));

    this._getProjetosSelectList$ = this._selectListService
      .getProjetosSelectList()
      .pipe(
        tap((response: ISelectList[]) => (this.projetosSelectList = response))
      );

    this._getValores$ = this._selectListService
      .getValores()
      .pipe(tap((response: ISelectList[]) => (this.valoresList = response)));

    this._getAllSelectLists$ = concat(
      this._getOrganizacoes$,
      this._getPessoas$,
      this._getPapeis$,
      this._getProjetosSelectList$,
      this._getValores$
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

    this._subscription.add(this._getProgramaById$.subscribe());
  }

  private iniciarForm(programaModel?: ProgramaFormModel): void {
    this.programaForm = this._nnfb.group({
      sigla: this._nnfb.control(programaModel?.sigla ?? null, [
        Validators.required,
        Validators.maxLength(12),
      ]),
      titulo: this._nnfb.control(programaModel?.titulo ?? null, [
        Validators.required,
        Validators.maxLength(150),
      ]),
      idOrgaoExecutor: this._nnfb.control(
        programaModel?.idOrgaoExecutor ?? null,
        Validators.required
      ),
      equipeCaptacao: this.equipeService.construirEquipeFormArray(
        programaModel?.equipeCaptacao
      ),
      projetosPropostos: this.construirProjetosPropostosFormArray(
        programaModel?.projetosPropostos
      ),
      valor: this._nnfb.group({
        tipo: this._nnfb.control(
          programaModel?.valor.tipo ?? null,
          Validators.required
        ),
        moeda: this._nnfb.control(
          programaModel?.valor.moeda,
          Validators.required
        ),
        quantia: this._nnfb.control(programaModel?.valor.quantia ?? null, [
          Validators.required,
          Validators.min(1),
        ]),
      }),
    });
  }

  private construirProjetosPropostosFormArray(
    projetosPropostos?: Array<IProgramaProjetoProposto>
  ): FormArray<FormGroup<ProgramaProjetoPropostoFormType>> {
    const projetosPropostosFormArray = this._nnfb.array<
      FormGroup<ProgramaProjetoPropostoFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (projetosPropostos) {
      projetosPropostos.forEach((projetoProposto) => {
        projetosPropostosFormArray.push(
          this.construirProjetoPropostoFormGroup(projetoProposto)
        );
      });
    }

    return projetosPropostosFormArray;
  }

  private construirProjetoPropostoFormGroup(
    projetoProposto?: IProgramaProjetoProposto
  ): FormGroup<ProgramaProjetoPropostoFormType> {
    return this._nnfb.group({
      idProjeto: this._nnfb.control(
        projetoProposto?.idProjeto ?? 0,
        Validators.required
      ),
      valor: this._nnfb.control(projetoProposto?.valor ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  private construirProjetoPropostoFormGroupNgSelectValue(
    ngSelectValue: number
  ): FormGroup<ProgramaProjetoPropostoFormType> {
    const projetoPropostoFormGroup = this.construirProjetoPropostoFormGroup();
    projetoPropostoFormGroup.patchValue({ idProjeto: ngSelectValue });
    return projetoPropostoFormGroup;
  }

  private incluirProjetoPropostoNoPrograma(
    projetoPropostoFormGroup: FormGroup<ProgramaProjetoPropostoFormType>
  ): void {
    this.projetosPropostos.push(projetoPropostoFormGroup);
  }

  public removerProjetoPropostoDoPrograma(index: number): void {
    this.projetosPropostos.removeAt(index);
  }

  private handleActionBreadcrumb(actionType: string): void {
    switch (actionType) {
      case 'edit':
        if (this.isAllowed('programaseditar')) {
          this.switchMode(true);
        }
        break;

      case 'cancel':
        this.cancelForm();
        break;

      case 'save':
        this.submitProgramaForm(this.programaForm);
        break;
    }
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path);
  }

  public switchMode(isEnabled: boolean, excluded?: Array<string>): void {
    this.isEdit = isEnabled;

    const controls = this.programaForm.controls;
    for (const key in controls) {
      !excluded?.includes(key) && isEnabled
        ? controls[key].enable({ emitEvent: false })
        : controls[key].disable({ emitEvent: false });
    }
  }

  private cancelForm(): void {
    this._router.navigate(['main', 'programas']);
  }

  private submitProgramaForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAllAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new ProgramaFormModel(form.value);

    // console.log(payload);

    switch (this.formMode) {
      case 'criar': {
        this._programasService
          .postPrograma(payload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Programa cadastrado com sucesso.'
                );
                this._router.navigateByUrl('main/programas');
              }
            })
          )
          .subscribe();
        break;
      }
      case 'editar': {
        this._programasService
          .putPrograma(this._programaEditId, payload)
          .pipe(
            tap((response) => {
              if (response) {
                this._toastService.showToast(
                  'success',
                  'Programa alterado com sucesso.'
                );
                this._router.navigateByUrl('main/programas');
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

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.programaForm.get(controlName) as AbstractControl<any, any>;
  }

  public get projetosPropostos(): FormArray<
    FormGroup<ProgramaProjetoPropostoFormType>
  > {
    return this.programaForm.get('projetosPropostos') as FormArray<
      FormGroup<ProgramaProjetoPropostoFormType>
    >;
  }

  public getSimbolo(): string {
    return MoedaHelper.getSimbolo(this.programaForm.value.valor.moeda ?? 'BRL');
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public toUppercaseInputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseInputTransformFn;

  public toUppercaseOutputTransformFn =
    NgxMaskTransformFunctionHelper.toUppercaseOutputTransformFn;

  public idMembroNgSelectChangeEvent(event: number): void {
    this.equipeService.idMembroNgSelectValue$.next(event);

    setTimeout(() => (this.idMembroEquipeCaptacao = null), 0);
  }

  public idProjetoPropostoNgSelectChangeEvent(event: number): void {
    this.incluirProjetoPropostoNoPrograma(
      this.construirProjetoPropostoFormGroupNgSelectValue(event)
    );

    setTimeout(() => (this.idProjetoProposto = null), 0);
  }

  public getProjetoPropostoNome(idProjetoProposto?: number) {
    return (
      this.projetosSelectList.find(
        (projetoSelect) => projetoSelect.id === idProjetoProposto
      )?.nome ?? ''
    );
  }

  public filtrarProjetosSelectList(
    projetosSelectList: ISelectList[]
  ): ISelectList[] {
    return projetosSelectList.filter(
      (projetoSelect) =>
        !this.projetosPropostos.value.some(
          (projetoProposto) => projetoProposto.idProjeto === projetoSelect.id
        )
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
