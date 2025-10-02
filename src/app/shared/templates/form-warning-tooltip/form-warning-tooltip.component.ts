import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'form-warning-tooltip',
  standalone: false,
  styleUrl: './form-warning-tooltip.component.scss',
  templateUrl: './form-warning-tooltip.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FormWarningTooltipComponent {
  public texto = input.required<string>();
}
