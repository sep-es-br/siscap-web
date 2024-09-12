import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacaoFormComponent } from './organizacao-form.component';

describe('OrganizacaoFormComponent', () => {
  let component: OrganizacaoFormComponent;
  let fixture: ComponentFixture<OrganizacaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacaoFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizacaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
