import { Component } from '@angular/core';

import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(private _authService: AuthenticationService) {}

  logIn() {
    this._authService.acessoCidadaoSignIn();
  }
}
