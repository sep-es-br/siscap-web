import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacoesComponent } from './organizacoes.component';

describe('OrganizacoesComponent', () => {
  let component: OrganizacoesComponent;
  let fixture: ComponentFixture<OrganizacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
