import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroIndicadoresComponent } from './filtro-indicadores.component';

describe('FiltroIndicadoresComponent', () => {
  let component: FiltroIndicadoresComponent;
  let fixture: ComponentFixture<FiltroIndicadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroIndicadoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiltroIndicadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
