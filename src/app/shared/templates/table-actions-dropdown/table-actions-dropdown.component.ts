import { Component, input, output } from '@angular/core';

import { UsuarioService } from '../../../core/services/usuario/usuario.service';

@Component({
  selector: 'table-actions-dropdown',
  standalone: false,
  templateUrl: './table-actions-dropdown.component.html',
  styleUrls: ['./table-actions-dropdown.component.scss'],
})
export class TableActionsDropdownComponent {
  public tableActionInput = input<number>(0);
  public tableActionOutput = output<{ acao: string; id: number }>();

  public permissaoDeletar: boolean = false;

  constructor(private _usuarioService: UsuarioService) {
    this.permissaoDeletar =
      this._usuarioService.verificarPermissao('adminAuth');
  }

  public emitirAcao(acao: string): void {
    this.tableActionOutput.emit({ acao: acao, id: this.tableActionInput() });
  }
}
