import { TestBed } from '@angular/core/testing';

import { ValorService } from './valor.service';

describe('ValorService', () => {
  let service: ValorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
