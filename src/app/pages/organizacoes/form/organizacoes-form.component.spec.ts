import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacoesFormComponent } from './organizacoes-form.component';

describe('OrganizacoesFormComponent', () => {
  let component: OrganizacoesFormComponent;
  let fixture: ComponentFixture<OrganizacoesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacoesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizacoesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
