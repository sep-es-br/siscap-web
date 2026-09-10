import { TestBed } from '@angular/core/testing';

import { PpaloaIntegracaoBiService } from './ppaloa-integracao-bi.service';

describe('PpaloaIntegracaoBiService', () => {
  let service: PpaloaIntegracaoBiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpaloaIntegracaoBiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
