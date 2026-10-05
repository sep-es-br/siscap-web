import { MENSAGENS } from '../../../core/utils/constants';
import { Component } from '@angular/core';

@Component({
  selector: 'query-no-results',
  standalone: false,
  templateUrl: './query-no-results.component.html',
})
export class QueryNoResultsComponent {
  public readonly MENSAGENS = MENSAGENS;
}
