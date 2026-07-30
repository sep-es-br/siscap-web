import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'siscap-ppa-loa-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ppa-loa-chip.component.html',
  styleUrl: './ppa-loa-chip.component.scss'
})
export class PpaLoaChipComponent {

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() type: string = 'base';
  @Input() removable: boolean = false;

  @Output() onRemove = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<void>();

  @Input() somenteLeitura: boolean = false;

  handleRemove(event: MouseEvent) {
    if (this.removable) {
      event.stopPropagation();
      this.onRemove.emit();
    }
  }

  handleClick() {
    this.onClick.emit();
  }

}
