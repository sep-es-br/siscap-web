import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartasConsultaComponent } from './cartas-consulta.component';

describe('CartasConsultaComponent', () => {
  let component: CartasConsultaComponent;
  let fixture: ComponentFixture<CartasConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartasConsultaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartasConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
