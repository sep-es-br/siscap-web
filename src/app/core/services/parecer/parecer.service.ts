import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { IParecer } from '../../interfaces/parecer.interface';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FilesService } from '../files/files.service';

@Injectable({
  providedIn: 'root',
})
export class ParecerService {

  private readonly _url = `${environment.apiUrl}/projetos`;

  baixarParecer(idParecer: AbstractControl<any, any> | null) {
    const downloadURL = `${this._url}/dic/parecer/${idParecer}/arquivo`;
    this.filesService.requestPDF(downloadURL).subscribe({
      next: (res) => {
        if (res instanceof HttpResponse) {
          const httpResponse = res as HttpResponse<Blob>;
          this.filesService.downloadPDF(httpResponse);
        }
      },
    });
  }

  private _parecerSnapshot: IParecer | null = null;

  public get parecerSnapshot(): IParecer | null {
    return this._parecerSnapshot;
  }

  private set parecerSnapshot(parecer: IParecer | null) {
    this._parecerSnapshot = parecer;
  }

  constructor(private _nnfb: NonNullableFormBuilder, 
    private filesService: FilesService,
    private readonly _http: HttpClient) { }

  public construirParecerForm(parecer?: IParecer): FormGroup {
    return this._nnfb.group({
      id: [parecer?.id ?? 0],
      idProjeto: [parecer?.idProjeto ?? 0],
      guidUnidadeOrganizacao: [parecer?.guidUnidadeOrganizacao ?? null],
      textoParecer: [parecer?.textoParecer ?? '', [Validators.required, Validators.maxLength(2000)]],
      statusParecer: [parecer?.statusParecer ?? null],
      dataEnvio: [parecer?.dataEnvio ?? null],
      guidDocumentoEdocs: [parecer?.guidDocumentoEdocs ?? null],
    });
  }

  public getValorAtual(): IParecer | null {
    return this._parecerSnapshot;
  }

  excluirAnexoParecer(idParecer: AbstractControl<any, any> | null) {
    const deleteURL = `${this._url}/dic/parecer/${idParecer}/arquivo`;
    console.log("chamando endpoint para excluir o parecer.. {}", deleteURL)
    return this._http.delete(deleteURL, {
        responseType: 'text',
      });
  }

}
