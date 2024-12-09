import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValorFormComponent } from './valor-form.component';

describe('ValorFormComponent', () => {
  let component: ValorFormComponent;
  let fixture: ComponentFixture<ValorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValorFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
