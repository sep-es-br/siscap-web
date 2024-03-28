import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableActionButtonsComponent } from './table-action-buttons.component';

describe('TableActionButtonsComponent', () => {
  let component: TableActionButtonsComponent;
  let fixture: ComponentFixture<TableActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionButtonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
