import { TestBed } from '@angular/core/testing';

import { SelectListService } from './select-list.service';

describe('SelectListService', () => {
  let service: SelectListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
