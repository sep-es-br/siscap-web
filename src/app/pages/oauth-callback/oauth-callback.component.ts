import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'siscap-oauth-callback',
  standalone: false,
  template: `
    <div class="p-4 text-center">
      Concluindo autenticação...
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {

  ngOnInit(): void {

    const parametros = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const accessToken = parametros.get('access_token');
    const state = parametros.get('state');

    // Remove imediatamente os tokens da barra de endereço.
    window.history.replaceState(
      null,
      '',
      window.location.pathname
    );

    if (!accessToken || !state) {
      window.location.replace('/login');
      return;
    }

    const form = document.createElement('form');

    form.method = 'POST';

    form.action =
      `${environment.apiUrl}/signin/acesso-cidadao-response`;

    const adicionarCampo = (
      nome: string,
      valor: string
    ): void => {

      const input = document.createElement('input');

      input.type = 'hidden';
      input.name = nome;
      input.value = valor;

      form.appendChild(input);
    };

    adicionarCampo('accessToken', accessToken);
    adicionarCampo('state', state);

    document.body.appendChild(form);

    form.submit();
  }
}