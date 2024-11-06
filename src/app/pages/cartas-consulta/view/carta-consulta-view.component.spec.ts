import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaConsultaViewComponent } from './carta-consulta-view.component';

describe('CartaConsultaViewComponent', () => {
  let component: CartaConsultaViewComponent;
  let fixture: ComponentFixture<CartaConsultaViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaConsultaViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartaConsultaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
