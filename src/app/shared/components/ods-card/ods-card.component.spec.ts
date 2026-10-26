import { TestBed } from '@angular/core/testing';
import { OdsCardComponent } from './ods-card.component';

describe('OdsCardComponent', () => {
  it('exibe os dados e emite adicionar sem submeter o formulario', () => {
    const fixture = TestBed.createComponent(OdsCardComponent);
    fixture.componentRef.setInput('nome', 'Educação de qualidade');
    fixture.componentRef.setInput('numero', 4);
    fixture.detectChanges();
    spyOn(fixture.componentInstance.adicionar, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('button');
    expect(button.textContent).toContain('Educação de qualidade');
    button.click();
    expect(fixture.componentInstance.adicionar.emit).toHaveBeenCalledTimes(1);
  });

  it('bloqueia as duas acoes quando desabilitado', () => {
    const fixture = TestBed.createComponent(OdsCardComponent);
    fixture.componentRef.setInput('desabilitado', true);
    fixture.detectChanges();
    spyOn(fixture.componentInstance.adicionar, 'emit');
    spyOn(fixture.componentInstance.remover, 'emit');
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    fixture.componentInstance.executar('adicionar');
    fixture.componentInstance.executar('remover');
    expect(fixture.componentInstance.adicionar.emit).not.toHaveBeenCalled();
    expect(fixture.componentInstance.remover.emit).not.toHaveBeenCalled();
  });

  it('mostra indicadores vinculados e emite remover na variante selecionada', () => {
    const fixture = TestBed.createComponent(OdsCardComponent);
    fixture.componentRef.setInput('variante', 'selecionado');
    fixture.componentRef.setInput('indicadores', [{ nomeIndicador: 'Taxa de matrícula' }]);
    fixture.detectChanges();
    spyOn(fixture.componentInstance.remover, 'emit');
    expect(fixture.nativeElement.textContent).toContain('Taxa de matrícula');
    expect(fixture.nativeElement.querySelector('.ods-suggested-card')).toBeNull();
    fixture.nativeElement.querySelector('.ods-sel-remove').click();
    expect(fixture.componentInstance.remover.emit).toHaveBeenCalledTimes(1);
  });
});
