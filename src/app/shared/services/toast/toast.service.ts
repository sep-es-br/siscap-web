import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IToastInfo {
  type: string;
  header: string;
  body: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public toastNotifier$: Subject<boolean> = new Subject<boolean>();

  public toastList: IToastInfo[] = [];

  constructor() {}

  showToast(toastInfo: IToastInfo) {
    this.toastList.push(toastInfo);
  }

  removeToast(targetToast: IToastInfo) {
    this.toastList = this.toastList.filter((toast) => {
      return toast != targetToast;
    });

    this.toastNotifier$.next(true);
  }
}
