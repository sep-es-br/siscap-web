import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProgramaFormModel } from '../../models/programa.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IPrograma,
  IProgramaTableData,
} from '../../interfaces/programa.interface';
import { Post } from '../../interfaces/http-post.interface';
import { Put } from '../../interfaces/http-put.interface';

import { environment } from '../../../../environments/environment';
import { FilesService } from '../files/files.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramasService
  extends BaseHttpService<IPrograma, IProgramaTableData>
  implements
    Post<IPrograma, ProgramaFormModel>,
    Put<IPrograma, ProgramaFormModel>
{
  private readonly _url = `${environment.apiUrl}/programas`;

  private readonly _idPrograma$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idPrograma$(): BehaviorSubject<number> {
    return this._idPrograma$;
  }

  constructor(
    private readonly _http: HttpClient,
    private filesService: FilesService,
  ) {
    super(_http, 'programas');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Novo Programa',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(config?: { editMode: boolean; }): Array<BotaoPropriedadesModel> {
    const botoesFinais = [];
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    botoesFinais.push(botaoSalvar, botaoCancelar);

    if (config && config.editMode) {
      const botaoExportar = BotoesConfig.gerarBotaoPropriedades('exportar');
      botoesFinais.push(botaoExportar);
    }

    return botoesFinais;
  }

  public post(body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.post<IPrograma>(this._url, body);
  }

  public put(id: number, body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.put<IPrograma>(`${this._url}/${id}`, body);
  }

  public exportById(idPrograma: number, nomePrograma: string): void {
    const downloadURL = `${this._url}/programa/${idPrograma}/baixar-pdf`;
    this.filesService.requestPDF(downloadURL).subscribe({
      next: (res) => {
        if (res instanceof HttpResponse) {
          const httpResponse = res as HttpResponse<Blob>;
          const fileName = `SISCAP - ${nomePrograma}`;
          this.filesService.downloadPDF(httpResponse, fileName);
        }
      },
    });
  }
}
