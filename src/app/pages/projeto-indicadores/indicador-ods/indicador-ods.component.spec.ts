import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { IOdsGestao } from '../../../core/interfaces/ods-gestao.interface';
import { OdsService } from '../../../core/services/ods/ods.service';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { IndicadorOdsComponent } from './indicador-ods.component';

describe('IndicadorOdsComponent', () => {
  let fixture: ComponentFixture<IndicadorOdsComponent>;
  const objetivo: IOdsGestao = {
    odsId: 1, ordemOds: 1, nomeOds: 'Erradicação da pobreza',
    descricaoOds: 'Acabar com a pobreza', corOds: '#e5243b'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadorOdsComponent],
      providers: [{ provide: OdsService, useValue: { buscarOds: () => of([objetivo]) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(IndicadorOdsComponent);
    fixture.componentInstance.formProjeto = new FormGroup({
      odsProjeto: new FormArray<FormGroup>([]),
      indicadoresProjeto: new FormArray<FormGroup>([]),
      impactos: new FormControl('')
    });
    fixture.componentInstance.isModoEdicao = true;
    fixture.componentInstance.statusProjeto = StatusProjetoEnum.Em_Elaboracao;
    fixture.detectChanges();
  });

  it('exibe e salva uma única ODS ao selecionar e permite remover e selecionar novamente', () => {
    const component = fixture.componentInstance;
    const selecionadas = component.formProjeto.get('odsProjeto') as FormArray;
    const selecionar = () => {
      fixture.nativeElement.querySelector('.ods-suggested-card').click();
      fixture.detectChanges();
      expect(selecionadas.length).toBe(1);
      expect(component.odsEscolhidas.length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.ods-sel-card').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.ods-suggested-card').length).toBe(0);
    };

    selecionar();
    component.adicionarOds(objetivo);
    expect(selecionadas.length).toBe(1);
    expect(component.odsEscolhidas.length).toBe(1);
    expect(component.formProjeto.dirty).toBeTrue();

    fixture.nativeElement.querySelector('.ods-sel-remove').click();
    fixture.detectChanges();
    expect(selecionadas.length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.ods-sel-card').length).toBe(0);
    selecionar();
  });
});
