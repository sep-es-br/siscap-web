import { AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[siscapDragScroll]',
  standalone: true,
  host: { class: 'siscap-drag-scroll', '[class.siscap-dragging]': 'arrastando' }
})
export class DragScrollDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private pointerId: number | null = null;
  private inicioX = 0;
  private inicioScroll = 0;
  private bloquearClique = false;
  arrastando = false;

  private readonly capturarClique = (event: MouseEvent): void => {
    if (!this.bloquearClique || event.detail === 0) return;
    this.bloquearClique = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  ngAfterViewInit(): void {
    this.element.addEventListener('click', this.capturarClique, true);
  }

  ngOnDestroy(): void {
    this.element.removeEventListener('click', this.capturarClique, true);
    this.finalizar();
  }

  @HostListener('pointerdown', ['$event'])
  iniciar(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.bloquearClique = false;
    if (this.element.scrollWidth <= this.element.clientWidth) return;
    this.pointerId = event.pointerId;
    this.inicioX = event.clientX;
    this.inicioScroll = this.element.scrollLeft;
  }

  @HostListener('pointermove', ['$event'])
  mover(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    if (event.buttons === 0) { this.finalizar(); return; }
    const deslocamento = event.clientX - this.inicioX;
    if (!this.arrastando && Math.abs(deslocamento) < 5) return;
    if (!this.arrastando) this.element.setPointerCapture(event.pointerId);
    this.arrastando = true;
    this.bloquearClique = true;
    event.preventDefault();
    this.element.scrollLeft = this.inicioScroll - deslocamento;
  }

  @HostListener('pointerup', ['$event'])
  @HostListener('pointercancel', ['$event'])
  @HostListener('lostpointercapture', ['$event'])
  encerrar(event: PointerEvent): void {
    if (this.pointerId === event.pointerId) this.finalizar();
  }

  private finalizar(): void {
    const pointerId = this.pointerId;
    this.pointerId = null;
    this.arrastando = false;
    if (pointerId !== null && this.element.hasPointerCapture(pointerId)) {
      this.element.releasePointerCapture(pointerId);
    }
  }
}
