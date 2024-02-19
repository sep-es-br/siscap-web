import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { DataTableKeyMap } from '../../shared/helpers/dataTableKeyMap.helper';

@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent implements OnChanges {
  @Input() source!: string;
  @Input() dataTableRows: Array<any> = [];

  @Output() actionEvent = new EventEmitter<{ type: string; content: any }>();

  public dataTableColumns: Array<{ name: string; prop: string }> = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataTableRows'].currentValue.length > 0) {
      this.dataTableColumns = DataTableKeyMap.DataTableColumnsArrayKeyMap(
        this.source,
        this.dataTableRows[0]
      );
    }
  }

  objectActionEvent(type: string, content: any) {
    this.actionEvent.emit({ type: type, content: content });
  }
}
