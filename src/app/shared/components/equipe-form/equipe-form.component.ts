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

import { IOpcoesDropdown, IOpcoesDropdownResponsavelProponente } from '../../../core/interfaces/opcoes-dropdown.interface';

import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { EquipeModel } from '../../../core/models/equipe.model';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { IProjeto } from '../../../core/interfaces/projeto.interface';
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

  public TipoStatusEnum = TipoStatusEnum;

  public isProponente: boolean = false;
  public permissaoRemoverMembro: boolean = false;

  constructor(
    public equipeService: EquipeService,
    private readonly _usuarioService: UsuarioService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
    private readonly _pessoasService: PessoasService,
  ) {

    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this.permissaoRemoverMembro =
      this._usuarioService.verificarPermissao('adminAuth');
  }
  
  public getMembroNome(subPessoa: string | null | undefined): string {
    const nomePadrao = this.pessoasOpcoesGoves.find(p => p.agentePublicoSub === subPessoa)?.nome;
    if (!nomePadrao) {
      return this.equipeProjeto.find( p => p.subPessoa === subPessoa)?.nome ?? '';
    }
    return nomePadrao ?? '';
  }

  public getPapelNome(idPapel: number | null | undefined): string {
    if (idPapel === 3) return 'Proponente';
    return this.tiposPapelOpcoes.find((papel) => papel.id === idPapel)?.nome ?? '';
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
 
  ngOnDestroy(): void {
    this.equipeService.equipeFormArray.clear();
  }

  public desabilitarCampo(index: number) : boolean {
    return ( this.statusProjeto != StatusProjetoEnum.Em_Elaboracao && !this.isNovoMembro(index) );
  }

}
