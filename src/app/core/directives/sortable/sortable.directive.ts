import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
} from '@angular/core';

enum DirectionShift {
  asc = 'desc',
  desc = 'asc',
}

export interface SortColumn {
  column: string;
  direction: string;
}

@Directive({
  selector: 'th[sortable]',
  standalone: false,
})
export class SortableDirective {
  @Input() sortable: string = '';
  @Output() sort = new EventEmitter<SortColumn>();

  private _targetColumn!: HTMLTableCellElement;
  private _targetColumnSiblings!: HTMLTableCellElement[];

  private _sortDirection: string = '';

  constructor(
    private _el: ElementRef<HTMLTableCellElement>,
    private _r2: Renderer2
  ) {
    this._targetColumn = this._el.nativeElement;

    this._targetColumnSiblings = this._r2.parentNode(
      this._targetColumn
    ).children;
  }

  @HostListener('click')
  emitSort() {
    for (const el of this._targetColumnSiblings) {
      if (el != this._targetColumn && el.hasAttributeNS(null, 'sortable')) {
        this._r2.removeClass(el, 'asc');
        this._r2.removeClass(el, 'desc');
      }
    }

    this._sortDirection =
      this._targetColumn.className
        .split(' ')
        .find((klass) => klass == 'asc' || klass == 'desc') ?? '';

    if (this._sortDirection !== '') {
      this._r2.removeClass(this._targetColumn, this._sortDirection);
    }

    const newDirection =
      DirectionShift[this._sortDirection as keyof typeof DirectionShift] ??
      'asc';

    this._r2.addClass(this._targetColumn, newDirection);

    this.sort.emit({ column: this.sortable, direction: newDirection });
  }
}
