import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioFormComponent } from './rateio-form.component';

describe('RateioFormComponent', () => {
  let component: RateioFormComponent;
  let fixture: ComponentFixture<RateioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateioFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RateioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
