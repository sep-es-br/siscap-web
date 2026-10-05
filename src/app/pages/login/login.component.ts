import { MENSAGENS, formatarMensagem } from '../../core/utils/constants';
import { Component } from '@angular/core';

import { AuthenticationService } from '../../core/services/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'siscap-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public readonly MENSAGENS = MENSAGENS;
  public readonly formatarMensagem = formatarMensagem;

  public yearPublish: string = '2024';
  constructor(
    private _authService: AuthenticationService,
  ) {}
  
  logIn() {
    this._authService.acessoCidadaoSignIn();
  }
    
  year_copyright() {
    const currentYear = new Date().getFullYear();
    if (currentYear > parseInt(this.yearPublish)) {
      const currentDate = new Date().getFullYear();
      return `${this.yearPublish} - ${currentDate}`;
    } else {
      return this.yearPublish;
    }
  }

}