import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  partition,
  Subscription,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { OrganizationResponsibleChangeWarningModalComponent } from '../../../shared/templates/organization-responsible-change-warning-modal/organization-responsible-change-warning-modal.component';

import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { SelectListService } from '../../../core/services/select-list/select-list.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import {
  EnderecoModel,
  PessoaFormModel,
  PessoaModel,
} from '../../../core/models/pessoa.model';

import { ISelectList } from '../../../core/interfaces/select-list.interface';
import {
  IPessoa,
  IPessoaAcessoCidadao,
  IPessoaForm,
} from '../../../core/interfaces/pessoa.interface';

import {
  EnderecoFormType,
  EnderecoFormTypeValue,
} from '../../../core/types/form/endereco-form.type';

import {
  LISTA_GENEROS,
  LISTA_NACIONALIDADES,
} from '../../../core/utils/constants';
import {
  alterarEstadoControlesFormulario,
  converterArrayBufferEmImgSrc,
} from '../../../core/utils/functions';
import { CPFValidator } from '../../../core/validators/cpf.validator';

@Component({
  selector: 'siscap-pessoa-form',
  standalone: false,
  templateUrl: './pessoa-form.component.html',
  styleUrl: './pessoa-form.component.scss',
})
export class PessoaFormComponent implements OnInit, OnDestroy {
  @ViewChild('importarPessoaCPFModal')
  private importarPessoaCPFModal!: TemplateRef<NgbModal>;

  private _atualizarPessoa$: Observable<IPessoa>;
  private _cadastrarPessoa$: Observable<number>;

  private _getPaisesSelectList$: Observable<ISelectList[]>;
  private _getOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getAreasAtuacaoSelectList$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _idPessoaEdicao: number = 0;
  private _idOrganizacaoResponsavel: number | null = null;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public pessoaForm: FormGroup = new FormGroup({});
  public importarPessoaCPFForm: FormGroup = new FormGroup({});

  public paisesSelectList: ISelectList[] = [];
  public estadosSelectList: ISelectList[] = [];
  public cidadesSelectList: ISelectList[] = [];
  public organizacoesSelectList: ISelectList[] = [];
  public areasAtuacaoSelectList: ISelectList[] = [];

  // Por hora, lista de valores hard-coded
  public nacionalidadesList: Array<string> = LISTA_NACIONALIDADES;
  public generosList: Array<string> = LISTA_GENEROS;

  public srcImagemPessoa: string = '';
  public arquivoImagemPessoa: File | undefined;

  constructor(
    private _nnfb: NonNullableFormBuilder,
    private _router: Router,
    private _pessoasService: PessoasService,
    private _selectListService: SelectListService,
    private _breadcrumbService: BreadcrumbService,
    private _toastService: ToastService,
    private _ngbModalService: NgbModal
  ) {
    const [editar$, criar$] = partition(
      this._pessoasService.idPessoa$,
      (idPessoa: number) => idPessoa > 0
    );

    this._atualizarPessoa$ = editar$.pipe(
      switchMap((idPessoa: number) => this._pessoasService.getById(idPessoa)),
      tap((response: IPessoa) => {
        const pessoaModel = new PessoaModel(response);

        this.iniciarForm(pessoaModel);

        this._idPessoaEdicao = pessoaModel.id;
        this._idOrganizacaoResponsavel = pessoaModel.idOrganizacaoResponsavel;

        this.srcImagemPessoa = converterArrayBufferEmImgSrc(
          pessoaModel.imagemPerfil
        );

        this.trocarModo(false);

        this.loading = false;
      })
    );

    this._cadastrarPessoa$ = criar$.pipe(
      tap(() => {
        this.iniciarForm();

        this.loading = false;
      }),
      switchMap(() => timer(1)),
      tap(() => this.dispararModalImportarPessoaCPF())
    );

    this._getPaisesSelectList$ = this._selectListService
      .getPaises()
      .pipe(tap((response) => (this.paisesSelectList = response)));

    this._getOrganizacoesSelectList$ = this._selectListService
      .getOrganizacoes()
      .pipe(tap((response) => (this.organizacoesSelectList = response)));

    this._getAreasAtuacaoSelectList$ = this._selectListService
      .getAreasAtuacao()
      .pipe(tap((response) => (this.areasAtuacaoSelectList = response)));

    this._getAllSelectLists$ = concat(
      this._getPaisesSelectList$,
      this._getOrganizacoesSelectList$,
      this._getAreasAtuacaoSelectList$
    );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getAllSelectLists$.subscribe());

    this._subscription.add(this._atualizarPessoa$.subscribe());
    this._subscription.add(this._cadastrarPessoa$.subscribe());
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.pessoaForm.get(controlName) as AbstractControl<any, any>;
  }

  public imgCropEvent(event: any): void {
    this.arquivoImagemPessoa = event[0];
  }

  public organizacaoResponsavelRemovida(event: number) {
    if (
      this._idOrganizacaoResponsavel &&
      event == this._idOrganizacaoResponsavel
    ) {
      const nomeOrganizacao = this.organizacoesSelectList.find(
        (org) => org.id == this._idOrganizacaoResponsavel
      )?.nome!;

      this.dispararModalAtencao(nomeOrganizacao);
    }
  }

  private iniciarForm(pessoaFormModel?: PessoaFormModel): void {
    this.pessoaForm = this._nnfb.group({
      sub: this._nnfb.control(null),
      nome: this._nnfb.control(pessoaFormModel?.nome ?? null, {
        validators: Validators.required,
      }),
      nomeSocial: this._nnfb.control(pessoaFormModel?.nomeSocial ?? null),
      nacionalidade: this._nnfb.control(
        pessoaFormModel?.nacionalidade ?? null,
        {
          validators: Validators.required,
        }
      ),
      genero: this._nnfb.control(pessoaFormModel?.genero ?? null, {
        validators: Validators.required,
      }),
      cpf: this._nnfb.control(pessoaFormModel?.cpf ?? null, {
        validators: [
          Validators.minLength(11),
          Validators.maxLength(11),
          CPFValidator,
        ],
      }),
      email: this._nnfb.control(pessoaFormModel?.email ?? null, {
        validators: [Validators.required, Validators.email],
      }),
      telefoneComercial: this._nnfb.control(
        pessoaFormModel?.telefoneComercial ?? null
      ),
      telefonePessoal: this._nnfb.control(
        pessoaFormModel?.telefonePessoal ?? null
      ),
      idOrganizacoes: this._nnfb.control(pessoaFormModel?.idOrganizacoes ?? []),
      idAreasAtuacao: this._nnfb.control(pessoaFormModel?.idAreasAtuacao ?? []),
      endereco: this.iniciarEnderecoForm(pessoaFormModel?.endereco),
    });

    this.pessoaFormValueChanges();
    this.enderecoFormValueChanges();
  }

  private iniciarEnderecoForm(
    enderecoModel?: EnderecoModel
  ): FormGroup<EnderecoFormType> {
    return this._nnfb.group({
      rua: this._nnfb.control(enderecoModel?.rua ?? null),
      numero: this._nnfb.control(enderecoModel?.numero ?? null),
      bairro: this._nnfb.control(enderecoModel?.bairro ?? null),
      complemento: this._nnfb.control(enderecoModel?.complemento ?? null),
      codigoPostal: this._nnfb.control(enderecoModel?.codigoPostal ?? null),
      idPais: this._nnfb.control(enderecoModel?.idPais ?? null),
      idEstado: this._nnfb.control(enderecoModel?.idEstado ?? null),
      idCidade: this._nnfb.control(enderecoModel?.idCidade ?? null),
    });
  }

  private pessoaFormValueChanges(): void {
    const endereco_idPaisFormControl = this.pessoaForm.get(
      'endereco.idPais'
    ) as FormControl<number | null>;

    const endereco_idEstadoFormControl = this.pessoaForm.get(
      'endereco.idEstado'
    ) as FormControl<number | null>;

    const endereco_idCidadeFormControl = this.pessoaForm.get(
      'endereco.idCidade'
    ) as FormControl<number | null>;

    endereco_idPaisFormControl.valueChanges.subscribe((idPaisValue) => {
      if (!idPaisValue) {
        endereco_idEstadoFormControl.patchValue(null);
        endereco_idCidadeFormControl.patchValue(null);
        this.estadosSelectList = [];
        this.cidadesSelectList = [];
      } else {
        this._selectListService
          .getEstados(idPaisValue)
          .pipe(tap((response) => (this.estadosSelectList = response)))
          .subscribe();
      }
    });

    endereco_idEstadoFormControl.valueChanges.subscribe((idEstadoValue) => {
      if (!idEstadoValue) {
        endereco_idCidadeFormControl.patchValue(null);
        this.cidadesSelectList = [];
      } else {
        this._selectListService
          .getCidades('ESTADO', idEstadoValue)
          .pipe(tap((response) => (this.cidadesSelectList = response)))
          .subscribe();
      }
    });
  }

  private enderecoFormValueChanges(): void {
    const enderecoForm = this.pessoaForm.get(
      'endereco'
    ) as FormGroup<EnderecoFormType>;

    enderecoForm.markAllAsTouched();

    enderecoForm.valueChanges
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        map<EnderecoFormTypeValue, boolean>((enderecoFormValue) =>
          Object.values(enderecoFormValue).some((value) => !!value)
        ),
        tap((resultado) => {
          for (const key in enderecoForm.controls) {
            const control = enderecoForm.get(key);

            resultado
              ? control?.setValidators(Validators.required)
              : control?.clearValidators();

            control?.updateValueAndValidity({ emitEvent: false });
          }
        })
      )
      .subscribe();
  }

  private dispararModalImportarPessoaCPF(): void {
    this.importarPessoaCPFForm = this._nnfb.group({
      cpf: this._nnfb.control(null, {
        validators: [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          CPFValidator,
        ],
      }),
    });

    const modalRef = this._ngbModalService.open(this.importarPessoaCPFModal, {
      backdrop: 'static',
      centered: true,
      keyboard: false,
    });

    modalRef.result.then(
      (resolve) => {
        const cpf = this.importarPessoaCPFForm.controls['cpf'].value;

        this.importarPessoaPorCPF(cpf);
      },
      (reject) => {}
    );
  }

  private importarPessoaPorCPF(cpf: string): void {
    this._pessoasService
      .buscarPessoaNoAcessoCidadaoPorCpf(cpf)
      .pipe(
        tap((response: IPessoaAcessoCidadao) => {
          this.pessoaForm.get('sub')?.patchValue(response.sub);
          this.pessoaForm.get('nome')?.patchValue(response.nome);
          this.pessoaForm.get('email')?.patchValue(response.email);
          this.pessoaForm.get('nomeSocial')?.patchValue(response.apelido);
        })
      )
      .subscribe();
  }

  private dispararModalAtencao(nomeOrganizacao: string): void {
    const modalRef = this._ngbModalService.open(
      OrganizationResponsibleChangeWarningModalComponent,
      {
        centered: true,
      }
    );

    modalRef.componentInstance.conteudo = nomeOrganizacao;
  }

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this.trocarModo(true);
        break;

      case 'cancelar':
        this.cancelar();
        break;

      case 'salvar':
        this.submitPessoaForm(this.pessoaForm);
        break;
    }
  }

  private trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const pessoaFormControls = this.pessoaForm.controls;

    alterarEstadoControlesFormulario(permitir, pessoaFormControls);

    const enderecoFormControls = (
      this.pessoaForm.get('endereco') as FormGroup<EnderecoFormType>
    ).controls;

    alterarEstadoControlesFormulario(permitir, enderecoFormControls);

    // Caso específico de email:
    this.pessoaForm.get('email')?.disable();
  }

  private cancelar(): void {
    this._router.navigate(['main', 'pessoas']);
  }

  private submitPessoaForm(form: FormGroup): void {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'Por favor, verifique os campos.',
      ]);
      return;
    }

    //Caso específico de email:
    form.get('email')?.enable();

    const payload = new PessoaFormModel(form.value as IPessoaForm);

    const requisicao = this._idPessoaEdicao
      ? this.atualizarPessoa(payload)
      : this.cadastrarPessoa(payload);

    requisicao.subscribe();
  }

  private cadastrarPessoa(payload: PessoaFormModel): Observable<IPessoa> {
    return this._pessoasService.post(payload, this.arquivoImagemPessoa).pipe(
      tap((response: IPessoa) => {
        this._toastService.showToast(
          'success',
          'Pessoa cadastrada com sucesso.'
        );
      }),
      finalize(() => this.cancelar())
    );
  }

  private atualizarPessoa(payload: PessoaFormModel): Observable<IPessoa> {
    return this._pessoasService
      .put(this._idPessoaEdicao, payload, this.arquivoImagemPessoa)
      .pipe(
        tap((response: IPessoa) => {
          this._toastService.showToast(
            'success',
            'Pessoa alterada com sucesso.'
          );
          this._router.navigateByUrl('main/pessoas');
        }),
        finalize(() => this.cancelar())
      );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._pessoasService.idPessoa$.next(0);
  }
}
