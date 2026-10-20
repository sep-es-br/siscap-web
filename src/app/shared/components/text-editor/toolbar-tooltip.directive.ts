import { Directive, ElementRef, Input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

// Quill cria os botões fora do template Angular. O PrimeNG deve escutar e
// posicionar a dica no botão real, e também limpar esses listeners ao destruir.
@Directive({
  selector: '[siscapToolbarTooltip]',
  standalone: true,
})
export class ToolbarTooltipDirective extends Tooltip {
  @Input('siscapToolbarTooltip') override content: string | undefined;
  @Input({ required: true }) tooltipTarget!: HTMLElement;

  override ngAfterViewInit(): void {
    this.el = new ElementRef(this.tooltipTarget);
    super.ngAfterViewInit();
  }
}
