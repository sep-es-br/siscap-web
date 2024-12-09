import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaConsultaFormComponent } from './carta-consulta-form.component';

describe('CartaConsultaFormComponent', () => {
  let component: CartaConsultaFormComponent;
  let fixture: ComponentFixture<CartaConsultaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaConsultaFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartaConsultaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
