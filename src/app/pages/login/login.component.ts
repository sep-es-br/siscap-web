import { Component } from '@angular/core';

import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
  selector: 'siscap-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public yearPublish: string = '2024';
  constructor(private _authService: AuthenticationService) {}

  logIn() {
    this._authService.acessoCidadaoSignIn();
  }

  year_copyright(){
    const currentYear = new Date().getFullYear();
    if (currentYear > parseInt(this.yearPublish)) {
      const currentDate = new Date().getFullYear();
      return `${this.yearPublish} - ${currentDate}`;
    } else {
      return this.yearPublish;
    }
  }
}
