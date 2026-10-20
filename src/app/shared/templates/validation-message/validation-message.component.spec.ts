import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message.component';

describe('ValidationMessageComponent', () => {
  let fixture: ComponentFixture<ValidationMessageComponent>;
  let control: FormControl<string | null>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CommonModule], declarations: [ValidationMessageComponent] });
    fixture = TestBed.createComponent(ValidationMessageComponent);
    control = new FormControl('', Validators.required);
    fixture.componentInstance.abstractControl = control;
  });

  it('mantem o asterisco e os erros no comportamento padrao', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('*');
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.error-message').length).toBe(2);
  });

  it('permite usar apenas o asterisco junto do rotulo', () => {
    fixture.componentInstance.exibirErros = false;
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('*');
    expect(control.hasError('required')).toBeTrue();
  });

  it('mostra o erro abaixo do campo sem duplicar o asterisco', () => {
    fixture.componentInstance.exibirObrigatorio = false;
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.error-message').length).toBe(1);
    expect(fixture.nativeElement.textContent.trim().length).toBeGreaterThan(1);
    expect(fixture.nativeElement.textContent).not.toContain('*');
  });

  it('nao reserva espaco de erro para um valor valido', () => {
    fixture.componentInstance.exibirObrigatorio = false;
    control.markAsTouched();
    control.setValue('25');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
    expect(fixture.nativeElement.matches(':empty')).toBeTrue();
  });
});
