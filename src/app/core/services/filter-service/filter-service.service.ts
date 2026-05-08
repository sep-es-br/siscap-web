import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IFiltroIndicador } from '../../interfaces/indicadores-catalogo-externo.interface';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private filterSubject = new BehaviorSubject<IFiltroIndicador | null>(null);

  filter$ = this.filterSubject.asObservable();

  setFilter(filter: IFiltroIndicador | null) {
    this.filterSubject.next(filter);
  }

}
