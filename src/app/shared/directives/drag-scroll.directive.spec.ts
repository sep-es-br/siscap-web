import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DragScrollDirective } from './drag-scroll.directive';

@Component({ standalone: true, imports: [DragScrollDirective], template: '<div siscapDragScroll><button (click)="cliques = cliques + 1">Card</button></div>' })
class DragHost { cliques = 0; }

describe('DragScrollDirective', () => {
  function preparar() {
    const fixture = TestBed.createComponent(DragHost);
    fixture.detectChanges();
    const area = fixture.nativeElement.querySelector('div') as HTMLElement;
    area.style.width = '100px';
    area.style.overflowX = 'auto';
    area.querySelector('button')!.style.width = '500px';
    spyOn(area, 'setPointerCapture');
    return { fixture, area, botao: area.querySelector('button')! };
  }

  it('rola com o mouse e impede selecionar o card ao terminar o arraste', () => {
    const { fixture, area, botao } = preparar();
    area.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 100 }));
    area.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 40 }));
    expect(area.scrollLeft).toBe(60);
    area.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse' }));
    botao.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(fixture.componentInstance.cliques).toBe(0);
    botao.click();
    expect(fixture.componentInstance.cliques).toBe(1);
  });

  it('preserva o clique quando o movimento e menor que o limiar', () => {
    const { fixture, area, botao } = preparar();
    area.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 100 }));
    area.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 98 }));
    area.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse' }));
    botao.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(fixture.componentInstance.cliques).toBe(1);
    expect(area.scrollLeft).toBe(0);
  });
});
