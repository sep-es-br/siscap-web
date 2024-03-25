import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { first } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';
import {
  IProjectGet,
  IProjectTable,
} from '../../shared/interfaces/project.interface';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public projetosList: Array<IProjectTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService
  ) {
    this._projetosService
      .getProjetos()
      .pipe(first())
      .subscribe((response: IProjectGet) => {
        this.projetosList = response.content;
      });
  }

  queryProject() {}

  projectDetails(data: any) {
    this._router.navigate(['form', 'detalhes'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  projectEdit(data: any) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  projectDelete(data: any) {
    if (
      confirm(`
            Tem certeza que deseja deletar o projeto?
            Sigla: ${data.sigla}
            Titulo: ${data.titulo}
            `)
    ) {
      this._projetosService.deleteProjeto(data.id).subscribe(
        (response) => {
          console.log(response);
          if (response) {
            alert('Projeto excluido com sucesso.');
          }
        },
        (err) => {},
        () => {
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this._router.navigate(['main', 'projetos']));
        }
      );
    }
  }

  actionEvent(type: string, data: any) {
    switch (type) {
      case 'detalhes':
        this.projectDetails(data);
        break;
      case 'editar':
        this.projectEdit(data);
        break;
      case 'deletar':
        this.projectDelete(data);
        break;

      default:
        break;
    }
  }
}
