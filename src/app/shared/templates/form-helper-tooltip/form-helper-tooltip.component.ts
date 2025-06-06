import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'form-helper-tooltip',
  standalone: false,
  styleUrl: './form-helper-tooltip.component.scss',
  templateUrl: './form-helper-tooltip.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FormHelperTooltipComponent {
  public texto = input.required<string>();
}
