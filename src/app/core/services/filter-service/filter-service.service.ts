import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterSubject = new BehaviorSubject<any>(null);
  filter$ = this.filterSubject.asObservable();

  setFilter(filter: any) {
    this.filterSubject.next(filter);
  }
}
