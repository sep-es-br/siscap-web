import { Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbModal,
  NgbModalModule,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';

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
    NgbPopoverModule,
  ],
  templateUrl: './equipe-form.component.html',
  styleUrl: './equipe-form.component.scss',
})
export class EquipeFormComponent implements OnDestroy {
  @Input() public pessoasOpcoes: IOpcoesDropdown[] = [];
  @Input() public tiposPapelOpcoes: IOpcoesDropdown[] = [];
  @Input() public isModoEdicao: boolean = false;

  public TipoStatusEnum = TipoStatusEnum;

  public permissaoRemoverMembro: boolean = false;

  constructor(
    public equipeService: EquipeService,
    private _usuarioService: UsuarioService,
    private _ngbModalService: NgbModal,
    private _toastService: ToastService
  ) {
    this.permissaoRemoverMembro =
      this._usuarioService.verificarPermissao('adminAuth');
  }

  public getMembroNome(idPessoa: number | null | undefined): string {
    return (
      this.pessoasOpcoes.find((pessoa) => pessoa.id === idPessoa)?.nome ?? ''
    );
  }

  public getPapelNome(idPapel: number | null | undefined): string {
    return (
      this.tiposPapelOpcoes.find((papel) => papel.id === idPapel)?.nome ?? ''
    );
  }

  public isMembroRemovido(index: number): boolean {
    return (
      this.equipeService.equipeFormArray.at(index).value.idStatus !=
      TipoStatusEnum.Ativo
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
      size: 'lg',
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
            TipoStatusEnum.Inativo
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
