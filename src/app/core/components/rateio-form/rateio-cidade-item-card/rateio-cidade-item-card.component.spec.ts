import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioCidadeItemCardComponent } from './rateio-cidade-item-card.component';

describe('RateioCidadeItemCardComponent', () => {
  let component: RateioCidadeItemCardComponent;
  let fixture: ComponentFixture<RateioCidadeItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioCidadeItemCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateioCidadeItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
