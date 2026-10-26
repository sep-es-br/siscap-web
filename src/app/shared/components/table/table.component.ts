import { CommonModule } from '@angular/common';
import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef } from '@angular/core';
import { SortColumn } from '../../directives/sortable/sortable.directive';
import { TableCellDirective } from './table-cell.directive';
import { TooltipModule } from 'primeng/tooltip';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  width?: string;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
  truncate?: boolean;
  tooltip?: boolean | ((row: T) => string);
  stopRowClick?: boolean | ((row: T) => boolean);
  value?: (row: T) => unknown;
}

/** Estrutura visual; busca, paginação dos dados e regras de negócio ficam no consumidor. */
@Component({
  selector: 'siscap-table',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T> {
  @Input() rows: readonly T[] | null = [];
  @Input() columns: readonly TableColumn<T>[] = [];
  @Input() rowClickable = false;
  @Input() fixedLayout = false;
  @Input() minWidth: string | null = null;
  @Input() caption = '';
  @Input() emptyMessage = '';
  @Input() rowKey: (row: T) => unknown = row => row;
  @Output() rowClick = new EventEmitter<T>();
  @Output() sortChange = new EventEmitter<SortColumn>();
  @ContentChildren(TableCellDirective) cells!: QueryList<TableCellDirective>;

  activeSort: SortColumn | null = null;

  cellTemplate(key: string): TemplateRef<unknown> | null {
    return this.cells?.find(cell => cell.siscapTableCell === key)?.template ?? null;
  }

  cellValue(row: T, column: TableColumn<T>): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
  }

  tooltipText(row: T, column: TableColumn<T>): string {
    if (typeof column.tooltip === 'function') return column.tooltip(row);
    return column.tooltip ? String(this.cellValue(row, column) ?? '') : '';
  }

  sort(column: TableColumn<T>): void {
    if (!column.sortKey) return;
    this.activeSort = {
      column: column.sortKey,
      direction: this.activeSort?.column === column.sortKey && this.activeSort.direction === 'asc' ? 'desc' : 'asc',
    };
    this.sortChange.emit(this.activeSort);
  }

  selectRow(row: T): void {
    if (this.rowClickable) this.rowClick.emit(row);
  }

  cellClick(event: MouseEvent, row: T, column: TableColumn<T>): void {
    const stop = typeof column.stopRowClick === 'function' ? column.stopRowClick(row) : column.stopRowClick;
    if (stop) event.stopPropagation();
  }

  trackRow = (_: number, row: T): unknown => this.rowKey(row);
  trackColumn = (_: number, column: TableColumn<T>): string => column.key;
}
