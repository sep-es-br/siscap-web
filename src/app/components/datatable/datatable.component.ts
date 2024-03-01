import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { Subject } from 'rxjs';
import { ADTSettings } from 'angular-datatables/src/models/settings';

import { DataTableObject } from '../../shared/interfaces/dataTableObject.interface';
import { DataTablesColumnBuilder } from '../../shared/helpers/dataTablesColumnBuilder.helper';

@Component({
  selector: 'app-datatable',
  standalone: false,
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.css',
})
export class DatatableComponent implements OnInit, OnChanges, OnDestroy {
  // @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
  @ViewChild('actionsTemplateRef')
  actionsTemplateRef!: TemplateRef<any>;

  @Input() sourceObject!: DataTableObject<any>;

  @Output() actionEventEmitter: EventEmitter<any> = new EventEmitter<{
    type: string;
    id: number;
  }>();

  public dtOptions: ADTSettings = {};
  public dtTrigger: Subject<ADTSettings> = new Subject<ADTSettings>();

  constructor(
    private _currencyPipeInstance: CurrencyPipe,
    private _datePipeInstance: DatePipe
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      searching: false,
      lengthChange: false,
      info: false,
      ordering: false, //Workaround para bug de sort com pipe aplicado
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

  private pipeGetter(value: string): { instance: any; args?: string[] } {
    let selectedPipe!: any;
    let pipeArgs!: any[];

    switch (value) {
      case 'currency':
        selectedPipe = this._currencyPipeInstance;
        pipeArgs = ['BRL', 'symbol'];
        break;
      case 'date':
        selectedPipe = this._datePipeInstance;
        pipeArgs = ['dd/MM/yyyy'];
        break;

      default:
        break;
    }

    return { instance: selectedPipe, args: pipeArgs };
  }

  public actionEventEmit(type: string, data: any) {
    this.actionEventEmitter.emit({ type: type, content: data });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sourceObject == undefined) {
      return;
    }

    const dataArray = this.sourceObject.dataArray;
    const columnTitles = this.sourceObject.columnTitles;
    const pipes = this.sourceObject.pipes;

    this.dtOptions.data = dataArray;
    this.dtOptions.columns = DataTablesColumnBuilder.columnBuilder(
      dataArray[0],
      columnTitles
    );

    if (pipes) {
      pipes.forEach((pipe) => {
        const targetColumn =
          this.dtOptions.columns?.find((column) => {
            return column.data == pipe.dataTarget;
          }) ?? undefined;

        const pipeInstance = this.pipeGetter(pipe.pipeName);

        if (targetColumn) {
          targetColumn.ngPipeInstance = pipeInstance.instance ?? undefined;
          targetColumn.ngPipeArgs = pipeInstance.args ?? undefined;
        }
      });
    }

    this.dtOptions.columns.push({
      data: null,
      title: 'Ações',
      width: '150',
      ngTemplateRef: {
        ref: this.actionsTemplateRef,
        context: {
          captureEvents: this.actionEventEmit,
        },
      },
    });

    this.dtTrigger.next(this.dtOptions);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
