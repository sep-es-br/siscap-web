import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import {
  combineLatest,
  concat,
  filter,
  finalize,
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  CartaConsultaFormModel,
  CartaConsultaModel,
} from '../../../core/models/carta-consulta.model';

import { TBotaoAcao } from '../../../shared/components/botao/botao.config';

import {
  ICartaConsulta,
  ICartaConsultaForm,
} from '../../../core/interfaces/carta-consulta.interface';
import {
  IObjetoOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownDestinatariosCartaConsulta,
  IOpcoesDropdownDestinatariosOpcoes,
} from '../../../core/interfaces/opcoes-dropdown.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';

@Component({
  selector: 'siscap-carta-consulta-form',
  standalone: false,
  templateUrl: './carta-consulta-form.component.html',
  styleUrl: './carta-consulta-form.component.scss',
})
export class CartaConsultaFormComponent implements OnInit, OnDestroy {
  private readonly _subscription: Subscription = new Subscription();

  private readonly _atualizarCartaConsulta$: Observable<ICartaConsulta>;
  private readonly _cadastrarCartaConsulta$: Observable<number>;

  private readonly _getObjetosOpcoes$: Observable<IObjetoOpcoesDropdown[]>;
  private readonly _getTiposOperacaoOpcoes$: Observable<IOpcoesDropdown[]>;
  private readonly _getAllOpcoes$: Observable<IOpcoesDropdown[]>;

  private readonly _getDestinatariosOpcoes$: Observable<IOpcoesDropdownDestinatariosOpcoes[]>;

  private _idCartaConsultaEdicao: number = 0;

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public cartaConsultaForm: FormGroup = new FormGroup({});

  public objetosOpcoes: IObjetoOpcoesDropdown[] = [];
  public tiposOperacaoOpcoes: IOpcoesDropdown[] = [];
  public destinatariosOpcoes: IOpcoesDropdownDestinatariosOpcoes[] = [];

  public destinatariosCarta: IOpcoesDropdownDestinatariosCartaConsulta[] = [];

  constructor(
    private readonly _nnfb: NonNullableFormBuilder,
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _toastService: ToastService
  ) {

    const [editar$, criar$] = partition(
      this._cartasConsultaService.idCartaConsulta$,
      (idCartaConsulta: number) => idCartaConsulta > 0
    );

    this._getObjetosOpcoes$ = this._opcoesDropdownService
      .getOpcoesObjetos()
      .pipe(tap((response) => (this.objetosOpcoes = response)));

    this._getTiposOperacaoOpcoes$ = this._opcoesDropdownService
      .getOpcoesTiposOperacao()
      .pipe(tap((response) => (this.tiposOperacaoOpcoes = response)));

    this._getDestinatariosOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes(TipoOrganizacaoEnum.Instituicao_Financeira)
      .pipe(
        map((response: IOpcoesDropdown[]) =>
          response.map(opcao => ({
            idOrganizacao: opcao.id,
            nomeOrganizacao: opcao.nome
          }))
        ),
        tap(destinatarios => {
          this.destinatariosOpcoes = destinatarios;
        })
      );

    this._getAllOpcoes$ = concat(
      this._getObjetosOpcoes$,
      this._getTiposOperacaoOpcoes$
    );

    this._atualizarCartaConsulta$ = editar$.pipe(
      switchMap((idCartaConsulta: number) =>
        this._cartasConsultaService.getById(idCartaConsulta).pipe()
      ),
      map<ICartaConsulta, CartaConsultaModel>(
        (response: ICartaConsulta) => new CartaConsultaModel(response)
      ),
      tap((cartaConsultaModel: CartaConsultaModel) => {

        this.destinatariosCarta = [...(cartaConsultaModel.destinatarios ?? [])];

        this.iniciarForm(cartaConsultaModel);

        this._idCartaConsultaEdicao = cartaConsultaModel.id;

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this._cartasConsultaService.gerarBotoesAcaoFormulario()
        );

        this.loading = false;

      })
    );

    this._atualizarCartaConsulta$ = editar$.pipe(
      switchMap((idCartaConsulta: number) =>
        this._cartasConsultaService.getById(idCartaConsulta)
      ),

      map<ICartaConsulta, CartaConsultaModel>(
        (response: ICartaConsulta) => new CartaConsultaModel(response)
      ),

      tap((cartaConsultaModel: CartaConsultaModel) => {

        this.destinatariosCarta = [...(cartaConsultaModel.destinatarios ?? [])];

        this.iniciarForm(cartaConsultaModel);

        this._idCartaConsultaEdicao = cartaConsultaModel.id;

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this._cartasConsultaService.gerarBotoesAcaoFormulario()
        );

        this.loading = false;
      })
    );


    this._cadastrarCartaConsulta$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
          this._cartasConsultaService.gerarBotoesAcaoFormulario()
        );

        this.loading = false;
      })
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );

  }

  ngOnInit(): void {
    this._subscription.add(this._getAllOpcoes$.subscribe());
    this._subscription.add(this._atualizarCartaConsulta$.subscribe());
    this._subscription.add(this._cadastrarCartaConsulta$.subscribe());
    this._subscription.add(this._getDestinatariosOpcoes$.subscribe());
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
      operacao: this._nnfb.control(cartaConsultaFormModel?.operacao ?? null),
      corpo: this._nnfb.control(cartaConsultaFormModel?.corpo ?? null, {
        validators: Validators.required,
      }),
      destinatarios: this._nnfb.control(cartaConsultaFormModel?.destinatarios ?? null, {
        validators: Validators.required,
      }),
    });

    if (cartaConsultaFormModel?.destinatarios?.length) {

      // const destinatariosParaSelect =
      //   cartaConsultaFormModel.destinatarios.map(d => ({
      //     id: d.idOrganizacao,
      //     nome: d.nomeOrganizacao
      //   }));

      // this.cartaConsultaForm.patchValue({
      //   destinatarios: destinatariosParaSelect
      // });

      // this.cartaConsultaForm.patchValue(
      //   { destinatarios: cartaConsultaFormModel?.destinatarios }
      // );

    }

    this.cartaConsultaFormValueChanges();

    this.monitorarDestinatarios();

  }

  private cartaConsultaFormValueChanges(): void { }

  private executarAcaoBreadcrumb(acao: TBotaoAcao): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Cancelar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.CartasConsulta
        );
        break;

      case BreadcrumbAcoesEnum.Salvar:
        this.submitCartaConsultaForm(this.cartaConsultaForm);
        break;
    }
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

    const payload = {
      ...this.cartaConsultaForm.value,
      destinatarios: this.destinatariosCarta
    } as ICartaConsultaForm;

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
      finalize(() => this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar))
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
        finalize(() =>
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar)
        )
      );
  }

  private monitorarDestinatarios(): void {

    this.cartaConsultaForm.get('destinatarios')!
      .valueChanges
      .pipe(
        withLatestFrom(this._cartasConsultaService.idCartaConsulta$)
      )
      .subscribe(([selecionados, idCartaConsulta]: [IOpcoesDropdownDestinatariosCartaConsulta[], number]) => {
        this.destinatariosCarta = (selecionados ?? []).map(item => ({
          id: item.id,
          nomeOrganizacao: item.nomeOrganizacao,
          idOrganizacao: item.idOrganizacao,
          idCartaConsulta
        }));

      });

  }

  // private filtrarDestinatariosOpcoes(destinatariosSelecionados: any[]): void {
  //   const selecionados = destinatariosSelecionados ?? [];
  //   this.destinatariosOpcoes = this.destinatariosCarta.filter(
  //     opcao =>
  //       !selecionados.some(
  //         d => d.idOrganizacao === opcao.idOrganizacao
  //       )
  //   );
  // }

  // private observarMudancasDestinatarios(): void {
  //   this.cartaConsultaForm
  //     .get('destinatarios')
  //     ?.valueChanges.subscribe(destinatariosSelecionados => {
  //       this.filtrarDestinatariosOpcoes(destinatariosSelecionados);
  //     });
  // }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._cartasConsultaService.idCartaConsulta$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

}
