import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { ApplicationRef } from '@angular/core';
import { NgbConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IndicadorAvulsoComponent } from './indicador-avulso.component';

describe('IndicadorAvulsoComponent', () => {
  let fixture: ComponentFixture<IndicadorAvulsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IndicadorAvulsoComponent] }).compileComponents();
    fixture = TestBed.createComponent(IndicadorAvulsoComponent);
    fixture.componentInstance.formProjeto = new FormGroup({ indicadoresAvulsosProjeto: new FormArray([]) });
  });

  it('abre sem gestao sem tentar acessar uma meta inexistente', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('siscap-modal')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.year-meta').length).toBe(0);
  });

  it('usa os botoes compartilhados e preserva cancelar e adicionar', () => {
    fixture.detectChanges();
    spyOn(fixture.componentInstance, 'salvar');
    spyOn(fixture.componentInstance.close, 'emit');
    const botoes = fixture.nativeElement.querySelectorAll('.form-actions siscap-botao button');
    expect(botoes.length).toBe(2);
    expect(botoes[0].type).toBe('button');
    expect(botoes[1].type).toBe('button');
    botoes[0].click();
    expect(fixture.componentInstance.close.emit).toHaveBeenCalled();
    botoes[1].click();
    expect(fixture.componentInstance.salvar).toHaveBeenCalled();
  });

  it('mostra erros abaixo dos campos sem inserir mensagens nos rotulos', () => {
    fixture.detectChanges();
    fixture.componentInstance.formIndicador.markAllAsTouched();
    fixture.detectChanges();
    const linhas = Array.from(fixture.nativeElement.querySelectorAll('.form-row')) as HTMLElement[];
    for (const linha of linhas.filter(item => item.querySelector('input, textarea'))) {
      expect(linha.querySelector('label .float-end')).toBeNull();
      const campo = linha.querySelector('input, textarea')!;
      const erro = linha.querySelector('.field-error')!;
      expect(erro.textContent?.trim().length).toBeGreaterThan(0);
      expect(campo.compareDocumentPosition(erro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('adiciona o indicador ao formulario e fecha a janela ng-bootstrap', async () => {
    TestBed.inject(NgbConfig).animation = false;
    const modalService = TestBed.inject(NgbModal);
    const modalRef = modalService.open(IndicadorAvulsoComponent);
    const resultado = modalRef.result.catch(motivo => motivo);
    const componente = modalRef.componentInstance as IndicadorAvulsoComponent;
    const indicadores = new FormArray<FormGroup>([]);
    componente.formProjeto = new FormGroup({ indicadoresAvulsosProjeto: indicadores });
    TestBed.inject(ApplicationRef).tick();
    componente.formIndicador.patchValue({
      nomeIndicador: 'Indicador de teste', formulaCalculo: 'Total',
      medidoPor: 'Fonte', unidadeMedida: 'Unidade', basedeReferencia: '2026'
    });
    const botao = document.querySelector('.modal .form-actions .btn-primary') as HTMLButtonElement;
    expect(botao).not.toBeNull();
    botao.click();
    await resultado;
    expect(indicadores.length).toBe(1);
    expect(indicadores.at(0).get('nomeIndicador')?.value).toBe('Indicador de teste');
    expect(modalService.hasOpenModals()).toBeFalse();
  });

  it('renderiza as metas dos anos da gestao e permite fechar', () => {
    fixture.componentInstance.gestao = {
      idGestao: 1, nomeGestao: 'Gestao', labels: [], desafios: [],
      doAno: 2026, ateAno: 2029, deAnoMeta: 2026, ateAnoMeta: 2029
    };
    fixture.detectChanges();
    const anos = [...fixture.nativeElement.querySelectorAll('.year-label')] as HTMLElement[];
    expect(anos.length).toBe(4);
    expect(anos[0].textContent).toContain('2026');
    expect(anos[3].textContent).toContain('2029');
    spyOn(fixture.componentInstance.close, 'emit');
    fixture.nativeElement.querySelector('.siscap-modal__close').click();
    expect(fixture.componentInstance.close.emit).toHaveBeenCalled();
  });
});
