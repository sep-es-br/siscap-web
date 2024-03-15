import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, finalize, first, tap } from 'rxjs';

import {
  IEntity,
  IEntityCreate,
} from '../../../shared/interfaces/entity.interface';
import { ISelectList } from '../../../shared/interfaces/select-list.interface';
import { EntidadesService } from '../../../shared/services/entidades/entidades.service';
import { SelectListService } from '../../../shared/services/select-list/select-list.service';
import { FormDataHelper } from '../../../shared/helpers/form-data.helper';

@Component({
  selector: 'app-entity-form',
  standalone: false,
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.css',
})
export class EntityFormComponent implements OnInit {
  @ViewChild('imagemPerfil') imagemPerfilInput!: ElementRef<HTMLInputElement>;

  public entityForm!: FormGroup;

  public loading: boolean = false;

  public formMode!: string;

  private _prepareForm$!: Observable<IEntity>;
  public entityEditId!: number;
  public entityFormInitialValue!: IEntityCreate;

  public uploadedPhotoFile: File | undefined;
  public uploadedPhotoSrc: string = '';

  public tiposEntidadesList: Array<ISelectList> = [];
  public paisesList: Array<ISelectList> = [];
  public cidadesList: Array<ISelectList> = [];
  public entidadesList: Array<ISelectList> = [];
  public pessoasList: Array<ISelectList> = [];

  constructor(
    private _fb: FormBuilder,
    private _entidadesService: EntidadesService,
    private _selectListService: SelectListService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.formMode = this._route.snapshot.params['mode'];
    this.entityEditId = this._route.snapshot.queryParams['id'] ?? null;

    this._prepareForm$ = this._entidadesService
      .getEntidadeById(this.entityEditId)
      .pipe(
        first(),
        tap((response) => {
          this.initForm(response);
          this.uploadedPhotoSrc = this.convertByteArraytoImgSrc(
            response.imagemPerfil as ArrayBuffer
          );
        }),
        finalize(() => {
          this.entityFormInitialValue = this.entityForm.value;

          if (this.formMode == 'detalhes') {
            const controls = this.entityForm.controls;
            for (const key in controls) {
              controls[key].disable();
            }
          }

          this.loading = false;
        })
      );

    this._selectListService
      .getTiposEntidades()
      .pipe(
        first(),
        tap((response) => (this.tiposEntidadesList = response))
      )
      .subscribe();

    this._selectListService
      .getPaises()
      .pipe(
        first(),
        tap((response) => {
          this.paisesList = response;
        })
      )
      .subscribe();

    this._selectListService
      .getEntidades()
      .pipe(
        first(),
        tap((response) => {
          this.entidadesList = response;
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

  ngOnInit(): void {
    if (this.formMode == 'criar') {
      this.initForm();
      return;
    }

    this.loading = true;

    this._prepareForm$.subscribe();
  }

  initForm(entity?: IEntity) {
    const nnfb = this._fb.nonNullable;
    this.entityForm = nnfb.group({
      nome: nnfb.control(entity?.nome ?? '', {
        validators: Validators.required,
      }),
      abreviatura: nnfb.control(entity?.abreviatura ?? ''),
      telefone: nnfb.control(entity?.telefone ?? ''),
      cnpj: nnfb.control(entity?.cnpj ?? '', {
        validators: [Validators.minLength(14), Validators.maxLength(14)],
      }),
      fax: nnfb.control(entity?.fax ?? ''),
      email: nnfb.control(entity?.email ?? '', {
        validators: Validators.email,
      }),
      site: nnfb.control(entity?.site ?? ''),
      idEntidadePai: nnfb.control(entity?.idEntidadePai ?? null),
      idPessoaResponsavel: nnfb.control(entity?.idPessoaResponsavel ?? null),
      idCidade: nnfb.control(entity?.idCidade ?? null),
      idPais: nnfb.control(entity?.idPais ?? null, {
        validators: Validators.required,
      }),
      idTipoEntidade: nnfb.control(entity?.idTipoEntidade ?? null, {
        validators: Validators.required,
      }),
    });
  }

  paisSelected(value: number | undefined) {
    if (!value) {
      this.cidadesList = [];
      return;
    }

    this._selectListService
      .getCidades('PAIS', value)
      .pipe(
        first(),
        tap((response) => (this.cidadesList = response))
      )
      .subscribe();
  }

  convertByteArraytoImgSrc(data: ArrayBuffer): string {
    return !!data ? 'data:image/jpeg;base64,' + data : '';
  }

  attachImg(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.uploadedPhotoFile = event.target.files[0];
      this.uploadedPhotoSrc = URL.createObjectURL(event.target.files[0]);
    }
  }

  removeImg() {
    this.imagemPerfilInput.nativeElement.value = '';
    this.uploadedPhotoFile = undefined;
    this.uploadedPhotoSrc = '';
  }

  cancelForm() {
    this._router.navigate(['main', 'entidades']);
  }

  submitEntityForm(form: FormGroup) {
    for (const key in form.controls) {
      form.controls[key].markAsTouched();
    }

    if (form.invalid) {
      return;
    }

    const payload = FormDataHelper.appendFormGrouptoFormData(form.value);

    if (!!this.uploadedPhotoFile) {
      payload.append('imagemPerfil', this.uploadedPhotoFile);
    }

    switch (this.formMode) {
      case 'criar':
        this._entidadesService.postEntidade(payload).subscribe((response) => {
          console.log(response);
          if (response) {
            alert('Órgão cadastrado com sucesso.');
            this._router.navigate(['main', 'entidades']);
          }
        });
        break;

      case 'editar':
        this._entidadesService
          .putEntidade(this.entityEditId, payload)
          .subscribe((response) => {
            console.log(response);
            if (response) {
              alert('Órgão atualizado com sucesso.');
              this._router.navigate(['main', 'entidades']);
            }
          });

        break;

      default:
        break;
    }
  }
}
