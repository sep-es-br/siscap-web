import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaAssinaturasComponent } from './programa-assinaturas.component';

describe('ProgramaAssinaturasComponent', () => {
  let component: ProgramaAssinaturasComponent;
  let fixture: ComponentFixture<ProgramaAssinaturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaAssinaturasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramaAssinaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
