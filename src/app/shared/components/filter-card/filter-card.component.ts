import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { FilterChip } from './filter-chip.interface';

@Component({
  selector: 'siscap-filter-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.scss'
})
export class FilterCardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chipsScroller') chipsScroller?: ElementRef<HTMLElement>;

  @Input() chips: FilterChip[] = [];
  @Input() disabled = false;
  @Input() loading = false;

  @Output() openFilter = new EventEmitter<void>();
  @Output() chipRemove = new EventEmitter<FilterChip>();

  canScrollLeft = false;
  canScrollRight = false;
  isDragging = false;

  private readonly dragThreshold = 5;
  private pointerId: number | null = null;
  private dragStartX = 0;
  private dragStartScrollLeft = 0;
  private hasDragged = false;
  private suppressNextClick = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private updateFrame?: number;

  ngAfterViewInit(): void {
    const scroller = this.chipsScroller?.nativeElement;
    if (!scroller) return;

    scroller.addEventListener('click', this.onScrollerClickCapture, true);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleNavUpdate());
      this.resizeObserver.observe(scroller);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.scheduleNavUpdate());
      this.mutationObserver.observe(scroller, { childList: true });
    }

    this.scheduleNavUpdate();
  }

  ngOnDestroy(): void {
    const scroller = this.chipsScroller?.nativeElement;
    scroller?.removeEventListener('click', this.onScrollerClickCapture, true);
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (this.updateFrame !== undefined) {
      cancelAnimationFrame(this.updateFrame);
    }
  }

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

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const scroller = this.chipsScroller?.nativeElement;
    if (!scroller) return;

    this.pointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartScrollLeft = scroller.scrollLeft;
    this.hasDragged = false;
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;

    if ((event.buttons & 1) === 0) {
      this.onPointerEnd(event);
      return;
    }

    const scroller = this.chipsScroller?.nativeElement;
    if (!scroller) return;

    const deltaX = event.clientX - this.dragStartX;
    if (!this.hasDragged && Math.abs(deltaX) < this.dragThreshold) return;

    if (!this.hasDragged) {
      scroller.setPointerCapture(event.pointerId);
    }

    this.hasDragged = true;
    this.isDragging = true;
    scroller.scrollLeft = this.dragStartScrollLeft - deltaX;
    event.preventDefault();
  }

  onPointerEnd(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;

    const scroller = this.chipsScroller?.nativeElement;
    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    if (this.hasDragged) {
      this.suppressNextClick = true;
      setTimeout(() => (this.suppressNextClick = false));
    }

    this.pointerId = null;
    this.hasDragged = false;
    this.isDragging = false;
  }

  scrollChips(direction: 'left' | 'right'): void {
    const scroller = this.chipsScroller?.nativeElement;
    if (!scroller) return;

    const scrollStep = Math.max(180, Math.round(scroller.clientWidth * 0.7));
    scroller.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth'
    });
  }

  updateNavVisibility(): void {
    const scroller = this.chipsScroller?.nativeElement;
    if (!scroller) return;

    const tolerance = 1;
    this.canScrollLeft = scroller.scrollLeft > tolerance;
    this.canScrollRight = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - tolerance;
  }

  private readonly onScrollerClickCapture = (event: MouseEvent): void => {
    if (!this.suppressNextClick) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.suppressNextClick = false;
  };

  private scheduleNavUpdate(): void {
    if (this.updateFrame !== undefined) {
      cancelAnimationFrame(this.updateFrame);
    }

    this.updateFrame = requestAnimationFrame(() => {
      this.updateFrame = undefined;
      this.updateNavVisibility();
    });
  }
}
