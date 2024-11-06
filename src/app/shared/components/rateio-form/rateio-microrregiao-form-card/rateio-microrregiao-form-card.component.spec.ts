import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card.component';

describe('RateioMicrorregiaoFormCardComponent', () => {
  let component: RateioMicrorregiaoFormCardComponent;
  let fixture: ComponentFixture<RateioMicrorregiaoFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioMicrorregiaoFormCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RateioMicrorregiaoFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
