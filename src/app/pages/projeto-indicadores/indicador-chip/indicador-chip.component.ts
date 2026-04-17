import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indicador-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicador-chip.component.html',
  styleUrls: ['./indicador-chip.component.scss']
})
export class IndicadorChipComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() removable: boolean = false;
  
  @Output() onRemove = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<void>();

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
