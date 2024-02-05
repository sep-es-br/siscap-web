import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  navigateLoginGov() {
    //Chamar authService com endpoint de verificação
    //this.authService.authGovBr() ou this.authService.authAcessoCidadao()
    this.authService.signIn();
    // window.location.href = 'https://acessocidadao.es.gov.br/';
  }
}
