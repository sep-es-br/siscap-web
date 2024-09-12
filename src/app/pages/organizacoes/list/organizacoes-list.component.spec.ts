import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacoesListComponent } from './organizacoes-list.component';

describe('OrganizacoesListComponent', () => {
  let component: OrganizacoesListComponent;
  let fixture: ComponentFixture<OrganizacoesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacoesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizacoesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
