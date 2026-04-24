import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbModalModule,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import { IOpcoesDropdown, IOpcoesDropdownResponsavelProponente } from '../../../core/interfaces/opcoes-dropdown.interface';

import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';

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
  @Input() public tiposPapelOpcoes: IOpcoesDropdown[] = [];

  @Input() public isModoEdicao: boolean = false;

  @Input() public pessoasOpcoesGoves: IOpcoesDropdownResponsavelProponente[] = [];

  @Input() public equipeProjeto: IEquipe[] = [];

  @Input() public statusProjeto: string = '';

  @Input() public subProponente: string = '';

  public TipoStatusEnum = TipoStatusEnum;

  public isProponente: boolean = false;

  public permissaoRemoverMembro: boolean = false;

  constructor(
    public equipeService: EquipeService,
    private readonly _usuarioService: UsuarioService,
    private readonly _toastService: ToastService,
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this.permissaoRemoverMembro = this._usuarioService.verificarPermissao('adminAuth');
  }

  ngOnDestroy(): void {
    this.equipeService.equipeFormArray.clear();
  }

  public getMembroNome(subPessoa: string | null | undefined): string {
    const nomePadrao = this.pessoasOpcoesGoves.find(p => p.agentePublicoSub === subPessoa)?.nome;
    if (!nomePadrao) {
      return this.equipeProjeto.find( p => p.subPessoa === subPessoa)?.nome ?? '';
    }
    return nomePadrao ?? '';
  }

  public getPapelNome(idPapel: number | null | undefined): string {
    if (idPapel === 3) return 'Redator';
    return this.tiposPapelOpcoes.find((papel) => papel.id === idPapel)?.nome ?? '';
  }

  public isMembroRemovido(index: number): boolean {
    return (
      this.equipeService.equipeFormArray.at(index).value.idStatus !=
      TipoStatusEnum.Ativo
    );
  }

  public isMembroRedator(index: number): boolean {
    return (
      this.equipeService.equipeFormArray.at(index).value.idPapel ==
      TipoPapelEnum.Redator
    );
  }

  public hasMembroRedator(): boolean {
    return (
      this.equipeService.equipeFormArray.controls.some((control) => control.value.idPapel === TipoPapelEnum.Redator)
    );
  }

  public isNovoMembro(index: number): boolean {
    return !this.equipeService.equipeFormArraySnapshot.some(
      (membro) =>
        membro.subPessoa ===
        this.equipeService.equipeFormArray.at(index).value.subPessoa
    );
  }

  public removerMembroDaEquipe(index: number): void {

    this.equipeService.construirExcluirMembroForm();

    const membroFormGroup = this.equipeService.equipeFormArray.at(index);

    if( this.statusProjeto == StatusProjetoEnum.Em_Elaboracao )
      membroFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Excluido);
    else
      membroFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Inativo);

    membroFormGroup.get('idPapel')?.removeValidators(Validators.required);
    membroFormGroup.get('idPapel')?.updateValueAndValidity();

    this._toastService.showToast(
      'info',
      this.equipeService.excluirMembroFormMembroStatusFormControl.value ==
        TipoStatusEnum.Inativo
        ? 'Membro removido da equipe.'
        : 'Membro excluído da equipe.',
      [
        `${this.getMembroNome(
          membroFormGroup.value.subPessoa
        )} - ${this.getPapelNome(membroFormGroup.value.idPapel)}`,
      ]
    );
  }

  public desabilitarCampo(index: number) : boolean {
    return ( this.statusProjeto != StatusProjetoEnum.Em_Elaboracao && !this.isNovoMembro(index) );
  }

  public papelDeveEstarDesabilitado(papel: IOpcoesDropdown, indexMembro: number): boolean {
    return (
      papel.id === TipoPapelEnum.Redator &&
      this.hasMembroRedator() &&
      !this.isMembroRedator(indexMembro)
      // Desativa a opção "Redator" dos papeis se já houver um membro incluso com o papel selecionado
    );
  }
}
