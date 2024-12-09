import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioMunicipioFormCardComponent } from './rateio-municipio-form-card.component';

describe('RateioMunicipioFormCardComponent', () => {
  let component: RateioMunicipioFormCardComponent;
  let fixture: ComponentFixture<RateioMunicipioFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioMunicipioFormCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RateioMunicipioFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
