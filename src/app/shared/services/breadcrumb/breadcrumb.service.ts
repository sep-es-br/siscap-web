import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbAction: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }
}
