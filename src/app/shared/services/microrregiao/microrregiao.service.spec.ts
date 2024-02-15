import { TestBed } from '@angular/core/testing';

import { MicrorregiaoService } from './microrregiao.service';

describe('MicrorregiaoService', () => {
  let service: MicrorregiaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicrorregiaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
