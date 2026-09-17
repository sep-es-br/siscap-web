import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetoAcoesRateioComponent } from './projeto-acoes-rateio.component';

describe('ProjetoAcoesRateioComponent', () => {
  let component: ProjetoAcoesRateioComponent;
  let fixture: ComponentFixture<ProjetoAcoesRateioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoAcoesRateioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetoAcoesRateioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
