import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
})
export class DatepickerComponent {
  @Input() public placeholderText: string = 'placeholderText';

  @Output() public dateValueChange: EventEmitter<string> =
    new EventEmitter<string>();

  public dateValue: string = '';

  public resetarData(): void {
    this.dateValue = '';
    this.dateValueChange.emit(this.dateValue);
  }
}
