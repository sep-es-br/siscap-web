import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramasListComponent } from './programas-list.component';

describe('ProgramasListComponent', () => {
  let component: ProgramasListComponent;
  let fixture: ComponentFixture<ProgramasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramasListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
