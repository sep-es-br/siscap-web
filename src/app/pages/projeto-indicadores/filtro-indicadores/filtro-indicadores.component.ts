import { Component, EventEmitter, Output } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-filtro-indicadores',
  standalone: true,
  imports: [
  ],
  templateUrl: './filtro-indicadores.component.html',
  styleUrl: './filtro-indicadores.component.scss'
})
export class FiltroIndicadoresComponent {
@Output() apply = new EventEmitter<any>();

applyFilter() {
  this.apply.emit('filtro aplicaodo');
}
}
