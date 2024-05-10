import { TestBed } from '@angular/core/testing';

import { OrganizacoesService } from './organizacoes.service';

describe('OrganizacoesService', () => {
  let service: OrganizacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
