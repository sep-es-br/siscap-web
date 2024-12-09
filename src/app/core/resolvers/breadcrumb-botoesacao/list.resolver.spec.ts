import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { breadcrumbBotoesAcao_ListResolver } from './list.resolver';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

describe('breadcrumbBotoesAcao_ListResolver', () => {
  const executeResolver: ResolveFn<IBreadcrumbBotaoAcao> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      breadcrumbBotoesAcao_ListResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
