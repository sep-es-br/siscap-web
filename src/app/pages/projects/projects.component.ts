import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription, first } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';
import { IProject } from '../../shared/interfaces/project.interface';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnDestroy {
  private _projetos$!: Subscription;

  public projetosList: IProject[] = [];

  constructor(
    private _router: Router,
    private _projetosService: ProjetosService
  ) {
    this._projetos$ = this._projetosService
      .getProjetos()
      .pipe(first())
      .subscribe((response) => {
        this.projetosList = response.content;
      });
  }

  redirectProjectCreateEdit(projectId?: number) {
    if (projectId) {
      this._router.navigate(['projects', 'create'], {
        queryParams: { isEdit: true, id: projectId },
      });
    } else {
      this._router.navigateByUrl('/projects/create');
    }
  }

  queryProject() {}

  handleEvent(event: any) {
    switch (event.type) {
      case 'showObjectDetails':
        //showDetails
        console.log('show');
        console.log(event.content);
        break;
      case 'editObject':
        //editObject
        // console.log(typeof event.content.id);
        this.redirectProjectCreateEdit(event.content.id);
        break;
      case 'deleteObject':
        //deleteObject
        console.log('delete');
        console.log(event.content);
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._projetos$.unsubscribe();
  }
}
