import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRateioFormComponent } from './new-rateio-form.component';

describe('NewRateioFormComponent', () => {
  let component: NewRateioFormComponent;
  let fixture: ComponentFixture<NewRateioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRateioFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewRateioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
