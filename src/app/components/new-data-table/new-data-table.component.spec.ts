import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDataTableComponent } from './new-data-table.component';

describe('NewDataTableComponent', () => {
  let component: NewDataTableComponent;
  let fixture: ComponentFixture<NewDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDataTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
