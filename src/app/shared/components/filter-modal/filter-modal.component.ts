import { MENSAGENS } from '../../../core/utils/constants';
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
  public readonly MENSAGENS = MENSAGENS;

  @Input() restoreDisabled = false;
  @Input() applyDisabled = false;
  @Input() ariaLabel = MENSAGENS.FILTROS;

  @Output() closeModal = new EventEmitter<void>();
  @Output() restore = new EventEmitter<void>();
  @Output() applyFilter = new EventEmitter<void>();
}
