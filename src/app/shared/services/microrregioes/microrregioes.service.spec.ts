import { TestBed } from '@angular/core/testing';

import { MicrorregioesService } from './microrregioes.service';

describe('MicrorregioesService', () => {
  let service: MicrorregioesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicrorregioesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
