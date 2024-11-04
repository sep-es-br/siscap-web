import { TestBed } from '@angular/core/testing';

import { OpcoesDropdownService } from './opcoes-dropdown.service';

describe('OpcoesDropdownService', () => {
  let service: OpcoesDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpcoesDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
