import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: 'th[sortable]',
  standalone: false,
})
export class SortableDirective {
  @Input() sortable: string = '';
  @Output() sort = new EventEmitter<any>();

  constructor(private el : ElementRef) {}

  @HostListener('click')
  sortColumn() {
    console.log(this.el)
    this.sort.emit(this.sortable);
  }

  // @HostListener('')
}
