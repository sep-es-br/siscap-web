import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumpService {
  breadcrumpAction: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }
}
