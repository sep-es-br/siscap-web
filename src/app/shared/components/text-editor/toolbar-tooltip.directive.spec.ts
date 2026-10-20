import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToolbarTooltipDirective } from './toolbar-tooltip.directive';

@Component({
  standalone: true,
  imports: [ToolbarTooltipDirective],
  template: `
    <button #target type="button">Negrito</button>
    <span hidden [siscapToolbarTooltip]="text" [tooltipTarget]="target"
      tooltipEvent="both" tooltipPosition="top" appendTo="body"></span>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../../../../../node_modules/primeng/resources/themes/lara-light-blue/theme.css',
    '../../../../../node_modules/primeng/resources/primeng.css',
  ],
})
class TooltipHostComponent {
  text = 'Negrito';
}

describe('ToolbarTooltipDirective', () => {
  let fixture: ComponentFixture<TooltipHostComponent>;
  let target: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TooltipHostComponent] });
    fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    target = fixture.nativeElement.querySelector('button');
  });

  it('shows on the actual Quill target and updates its content', fakeAsync(() => {
    target.dispatchEvent(new MouseEvent('mouseenter'));
    tick();
    const tooltip = document.body.querySelector('.p-tooltip');
    expect(tooltip?.textContent).toBe('Negrito');
    expect(target.getAttribute('aria-describedby')).toBe(tooltip?.id ?? null);
    const textStyle = getComputedStyle(tooltip!.querySelector('.p-tooltip-text')!);
    expect(textStyle.padding).toBe('12px');
    expect(textStyle.backgroundColor).toBe('rgb(75, 85, 99)');

    fixture.componentInstance.text = 'Texto atualizado';
    fixture.detectChanges();
    expect(tooltip?.textContent).toBe('Texto atualizado');

    target.dispatchEvent(new MouseEvent('mouseleave'));
    tick();
    expect(document.body.querySelector('.p-tooltip')).toBeNull();
  }));

  it('supports keyboard focus and removes the overlay and listeners on destroy', fakeAsync(() => {
    target.dispatchEvent(new FocusEvent('focus'));
    tick();
    expect(document.body.querySelector('.p-tooltip')).not.toBeNull();
    fixture.destroy();
    tick();
    expect(document.body.querySelector('.p-tooltip')).toBeNull();
    target.dispatchEvent(new MouseEvent('mouseenter'));
    tick();
    expect(document.body.querySelector('.p-tooltip')).toBeNull();
  }));
});
