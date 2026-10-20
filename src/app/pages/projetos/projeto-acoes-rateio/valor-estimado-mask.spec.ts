import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { CurrencyCaretDirective } from '../../../shared/directives/currency-caret.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective, CurrencyCaretDirective],
  template: `<input siscapCurrencyCaret [formControl]="valor" mask="separator.2" prefix="R$ " thousandSeparator="." decimalMarker="," [inputTransformFn]="entrada" [outputTransformFn]="saida">`
})
class ValorEstimadoHost {
  valor = new FormControl<number | null>(0);
  entrada = NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;
  saida = NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;
}

describe('Mascara do valor estimado da acao', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideNgxMask()] }));

  it('digita centavos sem acrescentar zeros ao valor inteiro', async () => {
    const fixture = TestBed.createComponent(ValorEstimadoHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    for (const digito of '123456') {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: digito }));
      const posicao = input.selectionStart!;
      input.setRangeText(digito, posicao, input.selectionEnd!, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      expect(input.selectionStart).toBe(input.value.length);
    }
    expect(fixture.componentInstance.valor.value).toBe(1234.56);
    expect(input.value).toContain('1.234,56');
    input.value = input.value.slice(0, -1);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.valor.value).toBe(123.45);
  });

  it('carrega um numero existente e permite limpar o campo', async () => {
    const fixture = TestBed.createComponent(ValorEstimadoHost);
    fixture.componentInstance.valor.setValue(90900990);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toContain('90.900.990,00');
    expect(fixture.componentInstance.valor.value).toBe(90900990);
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.valor.value).toBeNull();
  });
});
