import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpaLoaChipComponent } from './ppa-loa-chip.component';

describe('PpaLoaChipComponent', () => {
  let component: PpaLoaChipComponent;
  let fixture: ComponentFixture<PpaLoaChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpaLoaChipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PpaLoaChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
