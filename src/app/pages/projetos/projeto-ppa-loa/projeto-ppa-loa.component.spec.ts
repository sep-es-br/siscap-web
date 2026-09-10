import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetoPpaLoaComponent } from './projeto-ppa-loa.component';

describe('ProjetoPpaLoaComponent', () => {
  let component: ProjetoPpaLoaComponent;
  let fixture: ComponentFixture<ProjetoPpaLoaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoPpaLoaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetoPpaLoaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
