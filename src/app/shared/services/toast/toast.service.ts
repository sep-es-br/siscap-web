import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IToastInfo {
  type: string;
  title: string;
  content?: Array<string>;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public toastNotifier$: Subject<boolean> = new Subject<boolean>();

  public toastList: IToastInfo[] = [];

  constructor() {}

  public showToast(
    type: string,
    title: string,
    content?: Array<string>,
    delay?: number
  ) {
    const toastInfo: IToastInfo = {
      type: type,
      title: title,
    };

    if (content) {
      toastInfo.content = content;
    }

    if (delay) {
      toastInfo.delay = delay;
    }

    this.toastList.push(toastInfo);
    this.toastNotifier$.next(false);
  }

  public removeToast(targetToast: IToastInfo) {
    this.toastList = this.toastList.filter((toast) => {
      return toast != targetToast;
    });

    this.toastNotifier$.next(true);
  }
}
