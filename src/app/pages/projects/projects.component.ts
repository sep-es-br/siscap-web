import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription, first } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';
import { IProjectTable } from '../../shared/interfaces/project.interface';
import { DataTableObject } from '../../shared/interfaces/dataTableObject.interface';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnDestroy {
  private _projetos$!: Subscription;

  public projetosList: IProjectTable[] = [];

  public projetosDataTableObject!: DataTableObject<IProjectTable>;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService
  ) {
    this._projetos$ = this._projetosService
      .getProjetos()
      .pipe(first())
      //Substituir por Observer
      .subscribe(
        (response) => {
          this.projetosList = response.content;
        },
        (error: HttpErrorResponse) => {
          if (error.status == 401) {
            alert('Sua token expirou. Faça o login novamente.');
            this._router.navigateByUrl('/login');
          }
        },
        () => {
          this.projetosDataTableObject = {
            dataArray: this.projetosList,
            columnTitles: 'projetos',
            pipes: [{ dataTarget: 'valorEstimado', pipeName: 'currency' }],
          };
        }
      );
  }

  redirectProjectForm(mode: string, projectId?: number) {
    this._router.navigate(['form', mode], {
      relativeTo: this._route,
      queryParams: !!projectId ? { id: projectId } : undefined,
    });
  }

  queryProject() {}

  handleEvent(event: { type: string; content: any }) {
    if (event.type == 'delete') {
      if (
        confirm(`
              Tem certeza que deseja deletar o projeto?
              Sigla: ${event.content.sigla}
              Titulo: ${event.content.titulo}
              `)
      ) {
        this._projetos$ = this._projetosService
          .deleteProjeto(event.content.id)
          .subscribe(
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
                .then(() => this._router.navigate(['main', 'projects']));
            }
          );
        return;
      } else {
        return;
      }
    }

    this.redirectProjectForm(event.type, event.content.id);
  }

  ngOnDestroy(): void {
    this._projetos$.unsubscribe();
  }
}
