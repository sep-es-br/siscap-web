import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspeccoesComponent } from './prospeccoes.component';

describe('ProspeccoesComponent', () => {
  let component: ProspeccoesComponent;
  let fixture: ComponentFixture<ProspeccoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspeccoesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProspeccoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
