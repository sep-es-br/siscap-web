import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioMicrorregiaoItemCardComponent } from './rateio-microrregiao-item-card.component';

describe('RateioMicrorregiaoItemCardComponent', () => {
  let component: RateioMicrorregiaoItemCardComponent;
  let fixture: ComponentFixture<RateioMicrorregiaoItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioMicrorregiaoItemCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateioMicrorregiaoItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
