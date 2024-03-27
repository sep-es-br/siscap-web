import { TestBed } from '@angular/core/testing';

import { ToastNotifierService } from './toast-notifier.service';

describe('ToastNotifierService', () => {
  let service: ToastNotifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastNotifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
