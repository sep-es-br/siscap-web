import { DOCUMENT } from '@angular/common';
import { Directive, Inject, OnDestroy, OnInit } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Directive({
  selector: 'p-dropdown[siscapCloseOnScroll]',
  standalone: true,
})
export class CloseDropdownOnScrollDirective implements OnInit, OnDestroy {
  constructor(
    private readonly dropdown: Dropdown,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  private readonly onScroll = (event: Event): void => {
    // A lista deve continuar rolando sem fechar o dropdown.
    const target = event.target as Element | null;
    if (target?.nodeType === 1 && target.closest('.p-dropdown-panel')) return;
    if (this.dropdown.overlayVisible) this.dropdown.hide();
  };

  ngOnInit(): void {
    this.document.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('scroll', this.onScroll, true);
  }
}
