import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbModal,
  NgbModalModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { ProjetosFormService } from '../../../shared/services/projetos/projetos-form.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import { EquipeFormModel } from '../../../shared/models/equipe.model';

import { ISelectList } from '../../../shared/interfaces/select-list.interface';
import { IEquipe } from '../../../shared/interfaces/equipe.interface';

enum EquipeContext {
  PROJETO = 'Equipe de Elaboração',
}

@Component({
  selector: 'siscap-equipe-form',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbModalModule,
  ],
  templateUrl: './equipe-form.component.html',
  styleUrl: './equipe-form.component.scss',
})
export class EquipeFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ alias: 'context', required: true }) context: string = '';
  @Input({ alias: 'formMode', required: true }) formMode: string = '';
  @Input({ alias: 'isEdit', required: true }) isEdit: boolean = false;
  @Input({ alias: 'targetArray', required: true }) targetArray: FormArray<
    FormGroup<EquipeFormModel>
  > = new FormArray<FormGroup<EquipeFormModel>>([]);
  @Input({ alias: 'listArrays', required: true }) selectListArrayArgs: {
    [key: string]: Array<ISelectList>;
  } = {};

  private equipeElaboracaoSnapshot: IEquipe[] = [];

  public isAllowed: boolean = false;

  public selectInputLabel: string = '';

  public membrosListOriginal: ISelectList[] = [];
  public membrosListFiltered: ISelectList[] = [];
  public papeisList: ISelectList[] = [];

  public membroEquipeNgSelectValue: string | null = null;

  public membroStatus: number = 0;
  public justificativa: string = '';

  constructor(
    private _projetosFormService: ProjetosFormService,
    private _profileService: ProfileService,
    private _ngbModalService: NgbModal,
    private _toastService: ToastService
  ) {
    this.isAllowed = this._profileService.isAllowed('ADMIN_AUTH');
  }

  ngOnInit(): void {
    this._projetosFormService.idResponsavelProponente.valueChanges.subscribe(
      () => {
        this.targetArray.clear();
      }
    );

    this.equipeElaboracaoSnapshot = this._projetosFormService.equipeElaboracao
      .value as IEquipe[];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectInputLabel =
      EquipeContext[this.context as keyof typeof EquipeContext];

    const { membrosList, papeisList } = this.selectListArrayArgs;
    this.membrosListOriginal = this.membrosListFiltered = membrosList;
    this.papeisList = papeisList;

    if (changes['isEdit'] && !changes['isEdit'].isFirstChange()) {
      this.filterMembrosEquipeList();
    }
  }

  public getPessoaName(id: number | null | undefined): string {
    return (
      this.membrosListOriginal.find((membro) => membro.id === id)?.nome ?? ''
    );
  }

  public getPapelName(id: number | null | undefined): string {
    return this.papeisList.find((papel) => papel.id === id)?.nome ?? '';
  }

  public hasErrors(): boolean {
    return this.targetArray.controls.some(
      (control) => control.touched && control.invalid
    );
  }

  public addMemberToEquipeFormArray(idPessoa: number): void {
    const newMember = this._projetosFormService.buildMemberFormGroup(idPessoa);

    this.targetArray.push(newMember);

    this.filterMembrosEquipeList();
  }

  public deleteMemberFromEquipeFormArray(index: number): void {
    this.targetArray.removeAt(index);

    this.filterMembrosEquipeList();
  }

  public openRemoveMemberModal(modalTemplate: TemplateRef<any>, index: number) {
    const membroGroup = this.targetArray.at(index);

    const modalRef = this._ngbModalService.open(modalTemplate, {
      centered: true,
    });

    modalRef.result.then(
      (resolve) => {
        membroGroup.get('idStatus')?.patchValue(this.membroStatus);
        membroGroup.get('justificativa')?.patchValue(this.justificativa);

        this._toastService.showToast(
          'info',
          this.membroStatus == 2
            ? 'Membro removido da equipe.'
            : 'Membro excluído da equipe.',
          [
            `${this.getPessoaName(
              membroGroup.value.idPessoa
            )} - ${this.getPapelName(membroGroup.value.idPapel)}`,
            `Motivo: ${this.justificativa}`,
          ]
        );

        this.membroStatus = 0;
        this.justificativa = '';
      },
      (reject) => {
        this.membroStatus = 0;
        this.justificativa = '';
      }
    );
  }

  public memberRemoved(index: number): boolean {
    return this.targetArray.at(index).value.idStatus != 1;
  }

  public isNewMembroEquipe(index: number): boolean {
    return !this.equipeElaboracaoSnapshot.some(
      (membro) => membro.idPessoa === this.targetArray.at(index).value.idPessoa
    );
  }

  private filterMembrosEquipeList(): void {
    const idPessoaArray = this.targetArray.value.map((item) => item.idPessoa);

    this.membrosListFiltered = this.membrosListOriginal.filter(
      (membro) => !idPessoaArray.includes(membro.id)
    );

    setTimeout(() => {
      this.membroEquipeNgSelectValue = null;
    }, 1);
  }

  ngOnDestroy(): void {
    this.targetArray.clear();
  }
}
