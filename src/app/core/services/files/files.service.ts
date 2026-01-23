import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private readonly _httpClientRef: HttpClient;

  constructor(httpClientRef: HttpClient) {
    this._httpClientRef = httpClientRef;
  }

  public requestPDF(url: string): Observable<Blob> {
    const userHttpOptions: Object = {
      responseType: 'arraybuffer',
      observe: 'response',
    };

    return this._httpClientRef.get<Blob>(url, userHttpOptions);
  }

  public downloadPDF(response: HttpResponse<Blob>, fileName?: string) {
    if (response instanceof HttpResponse) {
      const httpResponse = response as HttpResponse<Blob>;
      const contentDisposition = httpResponse.headers.get('Content-Disposition');

      if (httpResponse.body && contentDisposition) {
        const pdfBlob = new Blob([httpResponse.body], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');

        document.body.appendChild(downloadLink);
        downloadLink.setAttribute('style', 'display: none');
        downloadLink.href = downloadUrl;

        if (fileName) {
          downloadLink.download = fileName;
        } else {
          downloadLink.download = contentDisposition
            .split('filename=')[1]
            .split(';')[0]
            .replace(/["']/g, '');
        }

        downloadLink.click();
        window.URL.revokeObjectURL(downloadUrl);
        downloadLink.remove();
      }
    }
  }
}
