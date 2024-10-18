import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  concat,
  finalize,
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { SelectListService } from '../../../core/services/select-list/select-list.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  CartaConsultaFormModel,
  CartaConsultaModel,
} from '../../../core/models/carta-consulta.model';

import {
  ICartaConsulta,
  ICartaConsultaForm,
} from '../../../core/interfaces/carta-consulta.interface';
import {
  IObjetoSelectList,
  ISelectList,
} from '../../../core/interfaces/select-list.interface';

import { alterarEstadoControlesFormulario } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-carta-consulta-form',
  standalone: false,
  templateUrl: './carta-consulta-form.component.html',
  styleUrl: './carta-consulta-form.component.scss',
})
export class CartaConsultaFormComponent implements OnInit, OnDestroy {
  private readonly _atualizarCartaConsulta$: Observable<ICartaConsulta>;
  private readonly _cadastrarCartaConsulta$: Observable<number>;

  private readonly _getObjetosSelectList$: Observable<IObjetoSelectList[]>;
  private readonly _getTiposOperacaoSelectList$: Observable<ISelectList[]>;
  private readonly _getAllSelectLists$: Observable<ISelectList[]>;

  private readonly _subscription: Subscription = new Subscription();

  private _idCartaConsultaEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public cartaConsultaForm: FormGroup = new FormGroup({});

  public objetosSelectList: IObjetoSelectList[] = [];
  public tiposOperacaoSelectList: ISelectList[] = [];

  constructor(
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _router: Router,
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _selectListService: SelectListService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _toastService: ToastService
  ) {
    const [editar$, criar$] = partition(
      this._cartasConsultaService.idCartaConsulta$,
      (idCartaConsulta: number) => idCartaConsulta > 0
    );

    this._atualizarCartaConsulta$ = editar$.pipe(
      switchMap((idCartaConsulta: number) =>
        this._cartasConsultaService.getById(idCartaConsulta)
      ),
      map<ICartaConsulta, CartaConsultaModel>(
        (response: ICartaConsulta) => new CartaConsultaModel(response)
      ),
      tap((cartaConsultaModel: CartaConsultaModel) => {
        this.iniciarForm(cartaConsultaModel);

        this._idCartaConsultaEdicao = cartaConsultaModel.id;

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarCartaConsulta$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.loading = false;
      })
    );

    this._getObjetosSelectList$ = this._selectListService
      .getObjetos()
      .pipe(tap((response) => (this.objetosSelectList = response)));

    this._getTiposOperacaoSelectList$ = this._selectListService
      .getTiposOperacao()
      .pipe(tap((response) => (this.tiposOperacaoSelectList = response)));

    this._getAllSelectLists$ = concat(
      this._getObjetosSelectList$,
      this._getTiposOperacaoSelectList$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    this._subscription.add(this._atualizarCartaConsulta$.subscribe());
    this._subscription.add(this._cadastrarCartaConsulta$.subscribe());
  }

  public get corpo(): FormControl<string | null> {
    return this.getControl('corpo') as FormControl<string | null>;
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.cartaConsultaForm.get(controlName) as AbstractControl<any, any>;
  }

  private iniciarForm(cartaConsultaFormModel?: CartaConsultaFormModel): void {
    this.cartaConsultaForm = this._nnfb.group({
      objeto: this._nnfb.control(cartaConsultaFormModel?.objeto ?? null, {
        validators: Validators.required,
      }),
      operacao: this._nnfb.control(cartaConsultaFormModel?.operacao ?? null, {
        validators: Validators.required,
      }),
      corpo: this._nnfb.control(cartaConsultaFormModel?.corpo ?? null, {
        validators: Validators.required,
      }),
    });

    this.cartaConsultaFormValueChanges();
  }

  private cartaConsultaFormValueChanges(): void {}

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this.trocarModo(true);
        break;

      case 'cancelar':
        this.cancelar();
        break;

      case 'salvar':
        this.submitCartaConsultaForm(this.cartaConsultaForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const cartaConsultaFormControls = this.cartaConsultaForm.controls;

    alterarEstadoControlesFormulario(permitir, cartaConsultaFormControls);
  }

  private cancelar(): void {
    this._router.navigate(['main', 'cartasconsulta']);
  }

  private submitCartaConsultaForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    const payload = new CartaConsultaFormModel(
      form.value as ICartaConsultaForm
    );

    const requisicao = this._idCartaConsultaEdicao
      ? this.atualizarCartaConsulta(payload)
      : this.cadastrarCartaConsulta(payload);

    requisicao.subscribe();
  }

  private cadastrarCartaConsulta(
    payload: CartaConsultaFormModel
  ): Observable<ICartaConsulta> {
    return this._cartasConsultaService.post(payload).pipe(
      tap((response: ICartaConsulta) => {
        this._toastService.showToast(
          'success',
          'Organização cadastrada com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  private atualizarCartaConsulta(
    payload: CartaConsultaFormModel
  ): Observable<ICartaConsulta> {
    return this._cartasConsultaService
      .put(this._idCartaConsultaEdicao, payload)
      .pipe(
        tap((response: ICartaConsulta) => {
          this._toastService.showToast(
            'success',
            'Organização alterada com sucesso.'
          );
        }),
        finalize(() => this.cancelar())
      );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._cartasConsultaService.idCartaConsulta$.next(0);
  }
}
