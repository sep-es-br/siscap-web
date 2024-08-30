import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioCidadeFormCardComponent } from './rateio-cidade-form-card.component';

describe('RateioCidadeFormCardComponent', () => {
  let component: RateioCidadeFormCardComponent;
  let fixture: ComponentFixture<RateioCidadeFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioCidadeFormCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateioCidadeFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
