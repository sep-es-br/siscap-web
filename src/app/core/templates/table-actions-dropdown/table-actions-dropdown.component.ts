import { Component, input, output } from '@angular/core';

@Component({
  selector: 'table-actions-dropdown',
  standalone: false,
  templateUrl: './table-actions-dropdown.component.html',
  styleUrls: ['./table-actions-dropdown.component.scss'],
})
export class TableActionsDropdownComponent {
  public tableActionInput = input<number>(0);
  public tableActionOutput = output<{ acao: string; id: number }>();

  constructor() {}

  public emitirAcao(acao: string): void {
    this.tableActionOutput.emit({ acao: acao, id: this.tableActionInput() });
  }
}
