import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _mensagemPadrao: string = 'Carregando...';

  private readonly _isProcessando$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private readonly _textoProcessando$: BehaviorSubject<string> =
    new BehaviorSubject<string>(this._mensagemPadrao);

  public get isProcessando$(): BehaviorSubject<boolean> {
    return this._isProcessando$;
  }

  public get textoProcessando$(): BehaviorSubject<string> {
    return this._textoProcessando$;
  }

  public iniciarProcessamento(texto?: string): void {
    if (texto) this.textoProcessando$.next(texto);
    this.isProcessando$.next(true);
  }

  public finalizarProcessamento(): void {
    this.textoProcessando$.next(this._mensagemPadrao);
    this.isProcessando$.next(false);
  }
}
