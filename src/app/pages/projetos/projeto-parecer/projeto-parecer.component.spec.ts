import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetoParecerComponent } from './projeto-parecer.component';

describe('ProjetoParecerComponent', () => {
  let component: ProjetoParecerComponent;
  let fixture: ComponentFixture<ProjetoParecerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoParecerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetoParecerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
