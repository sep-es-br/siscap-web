import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IndicadorCardComponent } from './indicador-card.component';

describe('IndicadorCardComponent', () => {
  let fixture: ComponentFixture<IndicadorCardComponent>;
  let component: IndicadorCardComponent;
  let metas: FormArray;
  let parentForm: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IndicadorCardComponent] });
    fixture = TestBed.createComponent(IndicadorCardComponent);
    component = fixture.componentInstance;
    metas = new FormArray([
      new FormGroup({ anoMeta: new FormControl(2028), valorMeta: new FormControl('', Validators.required) }),
    ]);
    parentForm = new FormGroup({ metasIndicadorProjeto: metas });
    component.indicador = { nome: 'Taxa de teste', fonte: 'SESP', unidadeMedida: '%', baseReferencia: '2026 (390.99)' };
    component.metasProjeto = metas;
    component.metasReferencia = [{ anoMeta: 2026, valorMeta: '390.99' }];
    component.idPrefixo = 'indicador-teste';
    component.podeRemover = true;
    fixture.detectChanges();
  });

  const input = (view: ComponentFixture<IndicadorCardComponent>): HTMLInputElement =>
    view.nativeElement.querySelector('.meta-value-input');

  it('mostra as metas de referencia para o indicador de catalogo', () => {
    expect(fixture.nativeElement.querySelectorAll('.meta-grid').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.meta-value').textContent).toContain('390.99');
    expect(fixture.nativeElement.querySelector('.indicator-type-badge')).toBeNull();
    expect(fixture.nativeElement.querySelector('.detail-row-reference').textContent).toContain('2026 (390.99)');
  });

  it('mostra formula e badge, sem metas de referencia, para o indicador de projeto', () => {
    component.indicador = { ...component.indicador, deProjeto: true, formula: 'Total / populacao' };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.indicator-type-badge')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.indicator-details').textContent).toContain('Total / populacao');
    expect(fixture.nativeElement.querySelectorAll('.meta-grid').length).toBe(1);
  });

  it('edita o controle original e propaga o valor ao formulario pai', () => {
    const originalControl = metas.at(0).get('valorMeta') as FormControl;
    input(fixture).value = '42.5';
    input(fixture).dispatchEvent(new Event('input'));
    expect(component.controleMeta(0)).toBe(originalControl);
    expect(parentForm.value.metasIndicadorProjeto[0].valorMeta).toBe('42.5');
    expect(parentForm.dirty).toBeTrue();
    expect(originalControl.hasValidator(Validators.required)).toBeTrue();
  });

  it('acompanha o estado desabilitado definido pelo consumidor', () => {
    metas.disable();
    fixture.detectChanges();
    expect(input(fixture).disabled).toBeTrue();
    metas.enable();
    fixture.detectChanges();
    expect(input(fixture).disabled).toBeFalse();
  });

  it('emite a remocao somente quando permitida', () => {
    const remove = jasmine.createSpy('remover');
    component.remover.subscribe(remove);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.remove-indicator-btn');
    button.click();
    expect(remove).toHaveBeenCalledTimes(1);
    component.podeRemover = false;
    fixture.detectChanges();
    button.click();
    component.removerIndicador();
    expect(button.disabled).toBeTrue();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('associa ano, obrigatoriedade e erro ao campo correto', () => {
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label.meta-year');
    const error: HTMLElement = fixture.nativeElement.querySelector('.meta-validation-message');
    expect(label.textContent).toContain('2028');
    expect(label.textContent).toContain('*');
    expect(label.htmlFor).toBe(input(fixture).id);
    expect(input(fixture).getAttribute('aria-describedby')).toBe(error.id);
    expect(error.matches(':empty')).toBeTrue();
    component.controleMeta(0).markAsTouched();
    fixture.detectChanges();
    expect(input(fixture).getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent!.trim().length).toBeGreaterThan(1);
    expect(error.textContent).not.toContain('*');
    component.controleMeta(0).setValue('25');
    fixture.detectChanges();
    expect(error.matches(':empty')).toBeTrue();
  });

  it('isola campos e identificadores quando reutilizado na mesma tela', () => {
    const second = TestBed.createComponent(IndicadorCardComponent);
    second.componentInstance.indicador = { nome: 'Outro indicador', deProjeto: true };
    second.componentInstance.idPrefixo = 'outro-indicador';
    second.componentInstance.metasProjeto = new FormArray([
      new FormGroup({ anoMeta: new FormControl(2028), valorMeta: new FormControl('10') }),
    ]);
    second.detectChanges();
    expect(input(second).id).not.toBe(input(fixture).id);
    input(second).value = '50';
    input(second).dispatchEvent(new Event('input'));
    expect(second.componentInstance.controleMeta(0).value).toBe('50');
    expect(component.controleMeta(0).value).toBe('');
  });
});
