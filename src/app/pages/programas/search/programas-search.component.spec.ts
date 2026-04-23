import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramasSearchComponent } from './programas-search.component';

describe('ProgramasSearchComponent', () => {
  let component: ProgramasSearchComponent;
  let fixture: ComponentFixture<ProgramasSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramasSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramasSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
