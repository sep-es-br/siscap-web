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
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { OrganizationResponsibleChangeWarningModalComponent } from '../../../shared/templates/organization-responsible-change-warning-modal/organization-responsible-change-warning-modal.component';

import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { SelectListService } from '../../../core/services/select-list/select-list.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
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
  selector: 'siscap-meu-perfil',
  standalone: false,
  templateUrl: './meu-perfil.component.html',
  styleUrl: './meu-perfil.component.scss',
})
export class MeuPerfilComponent implements OnInit, OnDestroy {
  private _atualizarMeuPerfil$: Observable<IPessoa>;

  private _getPaisesSelectList$: Observable<ISelectList[]>;
  private _getOrganizacoesSelectList$: Observable<ISelectList[]>;
  private _getAreasAtuacaoSelectList$: Observable<ISelectList[]>;
  private _getAllSelectLists$: Observable<ISelectList[]>;

  private _idPessoaEdicao: number = 0;
  private _idOrganizacaoResponsavel: number | null = null;

  private _subscription: Subscription = new Subscription();

  public loading: boolean = true;
  public isModoEdicao: boolean = true;

  public meuPerfilForm: FormGroup = new FormGroup({});

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
    private _usuarioService: UsuarioService,
    private _breadcrumbService: BreadcrumbService,
    private _toastService: ToastService,
    private _ngbModalService: NgbModal
  ) {
    this._atualizarMeuPerfil$ = this._pessoasService.subNovoPessoa$.pipe(
      filter((subNovo: string) => !!subNovo),
      switchMap((subNovo: string) =>
        this._pessoasService.buscarMeuPerfil(subNovo)
      ),
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

    this._subscription.add(this._atualizarMeuPerfil$.subscribe());
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.meuPerfilForm.get(controlName) as AbstractControl<any, any>;
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

  private iniciarForm(pessoaFormModel: PessoaFormModel): void {
    this.meuPerfilForm = this._nnfb.group({
      nome: this._nnfb.control(pessoaFormModel.nome, {
        validators: Validators.required,
      }),
      nomeSocial: this._nnfb.control(pessoaFormModel.nomeSocial),
      nacionalidade: this._nnfb.control(pessoaFormModel.nacionalidade, {
        validators: Validators.required,
      }),
      genero: this._nnfb.control(pessoaFormModel.genero, {
        validators: Validators.required,
      }),
      cpf: this._nnfb.control(pessoaFormModel.cpf, {
        validators: [
          Validators.minLength(11),
          Validators.maxLength(11),
          CPFValidator,
        ],
      }),
      email: this._nnfb.control(pessoaFormModel.email, {
        validators: [Validators.required, Validators.email],
      }),
      telefoneComercial: this._nnfb.control(pessoaFormModel.telefoneComercial),
      telefonePessoal: this._nnfb.control(pessoaFormModel.telefonePessoal),
      idOrganizacoes: this._nnfb.control(pessoaFormModel.idOrganizacoes),
      idAreasAtuacao: this._nnfb.control(pessoaFormModel.idAreasAtuacao),
      endereco: this.iniciarEnderecoForm(pessoaFormModel.endereco),
    });

    this.meuPerfilFormValueChanges();
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

  private meuPerfilFormValueChanges(): void {
    const endereco_idPaisFormControl = this.meuPerfilForm.get(
      'endereco.idPais'
    ) as FormControl<number | null>;

    const endereco_idEstadoFormControl = this.meuPerfilForm.get(
      'endereco.idEstado'
    ) as FormControl<number | null>;

    const endereco_idCidadeFormControl = this.meuPerfilForm.get(
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
    const enderecoForm = this.meuPerfilForm.get(
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
        this.submitMeuPerfilForm(this.meuPerfilForm);
        break;
    }
  }

  public trocarModo(permitir: boolean): void {
    this.isModoEdicao = permitir;

    const meuPerfilFormControls = this.meuPerfilForm.controls;

    alterarEstadoControlesFormulario(permitir, meuPerfilFormControls);

    const enderecoFormControls = (
      this.meuPerfilForm.get('endereco') as FormGroup<EnderecoFormType>
    ).controls;

    alterarEstadoControlesFormulario(permitir, enderecoFormControls);

    // Caso específico de email:
    this.meuPerfilForm.get('email')?.disable();
  }

  private cancelar(): void {
    this._router.navigate(['main', 'pessoas']);
  }

  private submitMeuPerfilForm(form: FormGroup) {
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

    this._pessoasService
      .atualizarMeuPerfil(
        this._idPessoaEdicao,
        payload,
        this.arquivoImagemPessoa
      )
      .pipe(
        tap((response: IPessoa) => {
          this._toastService.showToast(
            'success',
            'Perfil atualizado com sucesso.'
          );

          const usuarioPerfilAtual = this._usuarioService.usuarioPerfil;
          usuarioPerfilAtual.nome = response.nome;
          usuarioPerfilAtual.imagemPerfil = response.imagemPerfil;
          this._usuarioService.usuarioPerfil = usuarioPerfilAtual;
          this._usuarioService.atualizarDadosUsuarioPerfil$.next(true);
        }),
        finalize(() => this.cancelar())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._pessoasService.subNovoPessoa$.next('');
  }
}
