import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartasConsultaListComponent } from './cartas-consulta-list.component';

describe('CartasConsultaListComponent', () => {
  let component: CartasConsultaListComponent;
  let fixture: ComponentFixture<CartasConsultaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartasConsultaListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartasConsultaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
