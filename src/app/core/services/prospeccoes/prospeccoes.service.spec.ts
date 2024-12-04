import { TestBed } from '@angular/core/testing';

import { ProspeccoesService } from './prospeccoes.service';

describe('ProspeccoesService', () => {
  let service: ProspeccoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProspeccoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
