import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropostaFormComponent } from './proposta-form.component';

describe('PropostaFormComponent', () => {
  let component: PropostaFormComponent;
  let fixture: ComponentFixture<PropostaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropostaFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropostaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
