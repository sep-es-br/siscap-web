import { Component, input, output } from '@angular/core';

import { UsuarioService } from '../../../core/services/usuario/usuario.service';

import {
  ITableActionOutput,
  TTableActions,
} from './table-actions-dropdown.interface';

@Component({
  selector: 'table-actions-dropdown',
  standalone: false,
  templateUrl: './table-actions-dropdown.component.html',
  styleUrls: ['./table-actions-dropdown.component.scss'],
})
export class TableActionsDropdownComponent {
  public tableActionInput = input.required<number>();
  public tableActionOutput = output<ITableActionOutput>();

  public permissaoDeletarAdminAuth: boolean = false;

  constructor(private readonly _usuarioService: UsuarioService) {
    this.permissaoDeletarAdminAuth =
      this._usuarioService.verificarPermissao('adminAuth');
  }

  public emitirAcao(acao: TTableActions): void {
    const tableActionOutputObj: ITableActionOutput = {
      id: this.tableActionInput(),
      acao: acao,
    };

    this.tableActionOutput.emit(tableActionOutputObj);
  }
}
