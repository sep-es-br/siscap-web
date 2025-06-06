import { ComponentFixture, TestBed } from '@angular/core/testing';

import { indicadoresFormComponent } from './indicadores-form.component';

describe('EquipeFormComponent', () => {
  let component: IndicadoresFormComponent;
  let fixture: ComponentFixture<IndicadoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadoresFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IndicadoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


