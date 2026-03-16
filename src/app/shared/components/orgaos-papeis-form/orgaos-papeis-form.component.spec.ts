import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgaosPapeisFormComponent } from './orgaos-papeis-form.component';

describe('OrgaosPapeisFormComponent', () => {
  let component: OrgaosPapeisFormComponent;
  let fixture: ComponentFixture<OrgaosPapeisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgaosPapeisFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrgaosPapeisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
