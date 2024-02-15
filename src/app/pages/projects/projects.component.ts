import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription, first } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
//TODO: Tipar o array de projetos
export class ProjectsComponent {
  private _projetos$!: Subscription;

  public projetosList: any[] = [];

  constructor(
    private _router: Router,
    private _projetosService: ProjetosService
  ) {
    this._projetos$ = this._projetosService
      .getProjetos()
      .pipe(first())
      .subscribe((data) => {
        this.projetosList = data.content;
      });
  }

  redirectNewProject() {
    this._router.navigateByUrl('/projects/create');
  }

  queryProject() {}
}
