import { Component } from '@angular/core';
import { EventType, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  public breadcrumbNav: Array<string> = [];
  public currentPage: string = '';

  constructor(private _router: Router) {
    this._router.events
      .pipe(
        // Workaround para tipar Event_2 como NavigationEnd
        filter((event): event is NavigationEnd => {
          return event.type == EventType.NavigationEnd;
        })
      )
      .subscribe((next) => {
        const urlPaths = next['urlAfterRedirects'].split('/').filter((path) => {
          return path != '' && path != 'main';
        });
        this.breadcrumbNav = urlPaths;
        this.currentPage = this.breadcrumbNav.pop()!;
      });
  }

  navigateBreadcrumb(path: string) {
    this._router.navigate(['main', path]);
  }
}



/* 
- Redundancia do Home (ex: Home > Projetos > Novo Projeto)
- Botão "Novo Projeto" vai pra direita (igual prototipo)
- Icones de voltar/avançar
*/