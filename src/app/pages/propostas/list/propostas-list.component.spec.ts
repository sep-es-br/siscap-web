import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetosListComponent } from './projetos-list.component';

describe('ProjetosListComponent', () => {
  let component: ProjetosListComponent;
  let fixture: ComponentFixture<ProjetosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetosListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});