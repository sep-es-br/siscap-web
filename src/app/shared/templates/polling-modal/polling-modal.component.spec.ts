import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollingModalComponent } from './polling-modal.component';

describe('PollingModalComponent', () => {
  let component: PollingModalComponent;
  let fixture: ComponentFixture<PollingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollingModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PollingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
