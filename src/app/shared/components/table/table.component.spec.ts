import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableComponent, TableColumn } from './table.component';
import { TableCellDirective } from './table-cell.directive';

interface Row { id: number; name: string; }

@Component({
  standalone: true,
  imports: [TableComponent, TableCellDirective],
  template: `
    <siscap-table [rows]="rows" [columns]="columns" [rowClickable]="true"
      (rowClick)="selected = $event" (sortChange)="sortEvents.push($event)">
      <ng-template siscapTableCell="action" let-row>
        <button class="action" (click)="deleted = row.id">Excluir {{ row.name }}</button>
      </ng-template>
      <div tablePagination class="pagination">Página 1</div>
    </siscap-table>`,
})
class HostComponent {
  rows: Row[] | null = [{ id: 1, name: 'DIC' }];
  columns: TableColumn<Row>[] = [
    { key: 'name', label: 'Nome', sortKey: 'titulo', truncate: true, tooltip: true },
    { key: 'action', label: 'Ações', stopRowClick: true },
  ];
  selected?: Row;
  deleted?: number;
  sortEvents: { column: string; direction: string }[] = [];
}

describe('TableComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('renderiza valores padrão, célula personalizada e paginação projetada', async () => {
    const { el } = await setup();
    expect(el.querySelector('tbody td')?.textContent).toContain('DIC');
    expect(el.querySelector('.action')?.textContent).toContain('Excluir DIC');
    expect(el.querySelector('.pagination')?.textContent).toContain('Página 1');
  });

  it('emite ordenação alternada com a chave definida pelo consumidor', async () => {
    const { el, fixture, host } = await setup();
    const button = el.querySelector('.siscap-table-sort') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(el.querySelector('th')?.getAttribute('aria-sort')).toBe('ascending');
    button.click();
    fixture.detectChanges();
    expect(host.sortEvents).toEqual([
      { column: 'titulo', direction: 'asc' }, { column: 'titulo', direction: 'desc' },
    ]);
    expect(el.querySelector('th')?.getAttribute('aria-sort')).toBe('descending');
  });

  it('executa ação sem disparar abertura da linha', async () => {
    const { el, host } = await setup();
    (el.querySelector('.action') as HTMLButtonElement).click();
    expect(host.deleted).toBe(1);
    expect(host.selected).toBeUndefined();
    (el.querySelector('tbody td') as HTMLTableCellElement).click();
    expect(host.selected?.id).toBe(1);
  });

  it('aceita lista nula durante carregamento', async () => {
    const { fixture, host, el } = await setup();
    host.rows = null;
    fixture.detectChanges();
    expect(el.querySelectorAll('tbody tr').length).toBe(0);
  });

  it('preserva o texto completo para tooltip, inclusive com formatação personalizada', () => {
    const table = new TableComponent<Row>();
    const row = { id: 1, name: 'Título completo do registro' };
    expect(table.tooltipText(row, { key: 'name', label: 'Nome', tooltip: true })).toBe(row.name);
    expect(table.tooltipText(row, { key: 'name', label: 'Nome', tooltip: item => `Registro: ${item.name}` }))
      .toBe(`Registro: ${row.name}`);
    expect(table.tooltipText(row, { key: 'name', label: 'Nome' })).toBe('');
  });
});
