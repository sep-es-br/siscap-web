import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcoesFormComponent } from './acoes-form.component';


describe('EquipeFormComponent', () => {
  let component: AcoesFormComponent;
  let fixture: ComponentFixture<AcoesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcoesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AcoesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


