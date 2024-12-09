import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcanvasNavMenuComponent } from './nav-menu.component';

describe('OffcanvasNavMenuComponent', () => {
  let component: OffcanvasNavMenuComponent;
  let fixture: ComponentFixture<OffcanvasNavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffcanvasNavMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OffcanvasNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
