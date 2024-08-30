import { TestBed } from '@angular/core/testing';

import { RateioService } from './rateio.service';

describe('RateioService', () => {
  let service: RateioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RateioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
