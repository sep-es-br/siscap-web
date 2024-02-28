import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DataTablesColumnBuilder } from '../../shared/helpers/dataTablesColumnBuilder.helper';
import { Subject } from 'rxjs';

import { DataTableObject } from '../../shared/interfaces/dataTableObject.interface';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-new-data-table',
  standalone: false,
  templateUrl: './new-data-table.component.html',
  styleUrl: './new-data-table.component.css',
})
export class NewDataTableComponent implements OnInit, OnChanges, OnDestroy {
  // @ViewChild(DataTableDirective) dtElement!: DataTableDirective;

  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<ADTSettings> = new Subject<ADTSettings>();

  @Input() sourceObject!: DataTableObject<any>;

  constructor() {}

  ngOnInit(): void {
    this.dtOptions = {
      searching: false,
      lengthChange: false,
      info: false,
      language: {
        paginate: {
          first: 'Primeiro',
          last: 'Último',
          next: 'Próximo',
          previous: 'Anterior',
        },
      },
    };
  }

  // ngAfterViewInit(): void {
  //   this.dtTrigger.next(this.dtOptions);
  //   this.dtElement.dtInstance.then(
  //     (dtInstance: DataTables.Api) => {
  //       console.log(dtInstance)
  //     }
  //   )
  // }

  // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //   dtInstance.destroy();
  //   this.dtTrigger.next;
  // });

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sourceObject == undefined) {
      return;
    }

    const dataArray = this.sourceObject.dataArray;
    const columnTitles = this.sourceObject.columnTitles;
    const omittedFields = this.sourceObject.omittedFields;

    this.dtOptions.data = dataArray;
    this.dtOptions.columns = DataTablesColumnBuilder.columnBuilder(
      dataArray[0],
      columnTitles,
      omittedFields
    );

    this.dtTrigger.next(this.dtOptions);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
