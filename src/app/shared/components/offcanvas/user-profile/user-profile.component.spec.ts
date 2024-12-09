import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcanvasUserProfileComponent } from './user-profile.component';

describe('OffcanvasUserProfileComponent', () => {
  let component: OffcanvasUserProfileComponent;
  let fixture: ComponentFixture<OffcanvasUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffcanvasUserProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OffcanvasUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
