import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroAcoesComponent } from './filtro-acoes.component';

describe('FiltroAcoesComponent', () => {
  let component: FiltroAcoesComponent;
  let fixture: ComponentFixture<FiltroAcoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroAcoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiltroAcoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
