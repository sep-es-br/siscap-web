import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressoButtonComponent } from './progresso-button.component';

describe('ProgressoButtonComponent', () => {
  let component: ProgressoButtonComponent;
  let fixture: ComponentFixture<ProgressoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressoButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
