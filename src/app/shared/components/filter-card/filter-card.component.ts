import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { FilterChip } from './filter-chip.interface';

@Component({
  selector: 'siscap-filter-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.scss'
})
export class FilterCardComponent {
  @Input() chips: FilterChip[] = [];
  @Input() disabled = false;
  @Input() loading = false;

  @Output() openFilter = new EventEmitter<void>();
  @Output() chipRemove = new EventEmitter<FilterChip>();

  onOpenFilter(): void {
    if (!this.disabled && !this.loading) {
      this.openFilter.emit();
    }
  }

  onChipRemove(event: Event, chip: FilterChip): void {
    event.stopPropagation();

    if (!this.disabled && chip.removable) {
      this.chipRemove.emit(chip);
    }
  }
}
