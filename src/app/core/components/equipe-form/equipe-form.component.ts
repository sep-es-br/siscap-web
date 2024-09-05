import { Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbModal,
  NgbModalModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { EquipeService } from '../../../shared/services/equipe/equipe.service';
import { ProfileService } from '../../../shared/services/profile/profile.service';
import { ToastService } from '../../../shared/services/toast/toast.service';

import { ISelectList } from '../../../shared/interfaces/select-list.interface';

import { StatusEnum } from '../../../shared/enums/status.enum';

@Component({
  selector: 'siscap-equipe-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
  ],
  templateUrl: './equipe-form.component.html',
  styleUrl: './equipe-form.component.scss',
})
export class EquipeFormComponent implements OnDestroy {
  @Input() public pessoasList: ISelectList[] = [];
  @Input() public papeisList: ISelectList[] = [];
  @Input() public formMode: string = '';
  @Input() public isEdit: boolean = false;

  public StatusEnum = StatusEnum;

  public permissaoRemoverMembro: boolean = false;

  constructor(
    public equipeService: EquipeService,
    private _profileService: ProfileService,
    private _ngbModalService: NgbModal,
    private _toastService: ToastService
  ) {
    this.permissaoRemoverMembro = this._profileService.isAllowed('adminAuth');
  }

  public getMembroNome(idPessoa: number | null | undefined): string {
    return (
      this.pessoasList.find((pessoa) => pessoa.id === idPessoa)?.nome ?? ''
    );
  }

  public getPapelNome(idPapel: number | null | undefined): string {
    return this.papeisList.find((papel) => papel.id === idPapel)?.nome ?? '';
  }

  public isMembroRemovido(index: number): boolean {
    return (
      this.equipeService.equipeFormArray.at(index).value.idStatus !=
      StatusEnum.Ativo
    );
  }

  public isNovoMembro(index: number): boolean {
    return !this.equipeService.equipeFormArraySnapshot.some(
      (membro) =>
        membro.idPessoa ===
        this.equipeService.equipeFormArray.at(index).value.idPessoa
    );
  }

  public removerMembroDaEquipe(index: number): void {
    this.equipeService.removerMembroDaEquipe(index);
  }

  public abrirExcluirMembroModal(
    modalTemplate: TemplateRef<any>,
    index: number
  ) {
    this.equipeService.construirExcluirMembroForm();

    const membroFormGroup = this.equipeService.equipeFormArray.at(index);

    const modalRef = this._ngbModalService.open(modalTemplate, {
      centered: true,
    });

    modalRef.result.then(
      (resolve) => {
        membroFormGroup
          .get('idStatus')
          ?.patchValue(
            this.equipeService.excluirMembroFormMembroStatusFormControl.value!
          );
        membroFormGroup
          .get('justificativa')
          ?.patchValue(
            this.equipeService.excluirMembroFormJustificativaFormControl.value
          );

        this._toastService.showToast(
          'info',
          this.equipeService.excluirMembroFormMembroStatusFormControl.value ==
            StatusEnum.Inativo
            ? 'Membro removido da equipe.'
            : 'Membro excluído da equipe.',
          [
            `${this.getMembroNome(
              membroFormGroup.value.idPessoa
            )} - ${this.getPapelNome(membroFormGroup.value.idPapel)}`,
            `Motivo: ${this.equipeService.excluirMembroFormJustificativaFormControl.value}`,
          ]
        );
      },
      (reject) => {}
    );
  }

  ngOnDestroy(): void {
    this.equipeService.equipeFormArray.clear();
  }
}
