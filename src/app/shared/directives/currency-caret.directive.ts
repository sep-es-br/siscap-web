import { AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, inject } from '@angular/core';

/** Preserva a digitação no fim quando a máscara adiciona prefixo e centavos. */
@Directive({ selector: 'input[siscapCurrencyCaret]', standalone: true })
export class CurrencyCaretDirective implements AfterViewInit, OnDestroy {
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private destruido = false;

  @HostListener('click')
  @HostListener('focus')
  posicionarNoFim(): void {
    queueMicrotask(() => {
      if (!this.destruido && this.input.ownerDocument.activeElement === this.input) {
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
      }
    });
  }
  private readonly ajustarCursor = (): void => {
    const estavaNoFim = this.input.selectionStart === this.input.value.length &&
      this.input.selectionEnd === this.input.value.length;
    if (!estavaNoFim) return;
    queueMicrotask(() => {
      if (!this.destruido && this.input.ownerDocument.activeElement === this.input) {
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
      }
    });
  };

  ngAfterViewInit(): void {
    this.input.addEventListener('input', this.ajustarCursor, true);
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.input.removeEventListener('input', this.ajustarCursor, true);
  }
}
