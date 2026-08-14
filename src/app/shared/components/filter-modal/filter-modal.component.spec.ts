import { FilterModalComponent } from './filter-modal.component';

describe('FilterModalComponent', () => {
  let component: FilterModalComponent;

  beforeEach(() => {
    component = new FilterModalComponent();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir os eventos do modal', () => {
    spyOn(component.closeModal, 'emit');
    spyOn(component.restore, 'emit');
    spyOn(component.applyFilter, 'emit');

    component.closeModal.emit();
    component.restore.emit();
    component.applyFilter.emit();

    expect(component.closeModal.emit).toHaveBeenCalled();
    expect(component.restore.emit).toHaveBeenCalled();
    expect(component.applyFilter.emit).toHaveBeenCalled();
  });
});
