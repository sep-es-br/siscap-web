import { FilterCardComponent } from './filter-card.component';
import { FilterChip } from './filter-chip.interface';

describe('FilterCardComponent', () => {
  let component: FilterCardComponent;
  const chip: FilterChip = {
    key: 'desafio:1',
    label: 'Desafio',
    value: 'Desafio 1',
    type: 'filter',
    removable: true,
    group: 'desafio',
    valueId: 1
  };

  beforeEach(() => {
    component = new FilterCardComponent();
  });

  it('emite a abertura quando está habilitado', () => {
    spyOn(component.openFilter, 'emit');

    component.onOpenFilter();

    expect(component.openFilter.emit).toHaveBeenCalled();
  });

  it('não emite a abertura quando está desabilitado', () => {
    spyOn(component.openFilter, 'emit');
    component.disabled = true;

    component.onOpenFilter();

    expect(component.openFilter.emit).not.toHaveBeenCalled();
  });

  it('emite o chip removido e interrompe a propagação', () => {
    const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
    spyOn(component.chipRemove, 'emit');

    component.onChipRemove(event, chip);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.chipRemove.emit).toHaveBeenCalledWith(chip);
  });
});
