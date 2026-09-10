import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'siscap-filter-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FilterModalComponent {
  @Input() restoreDisabled = false;
  @Input() applyDisabled = false;
  @Input() ariaLabel = 'Filtros';

  @Output() closeModal = new EventEmitter<void>();
  @Output() restore = new EventEmitter<void>();
  @Output() applyFilter = new EventEmitter<void>();
}
