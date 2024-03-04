import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, Subscription, first } from 'rxjs';
import { ADTSettings } from 'angular-datatables/src/models/settings';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';
import { IProjectGet } from '../../shared/interfaces/project.interface';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit, OnDestroy {
  // @ViewChild(DataTableDirective) dtElement!: DataTableDirective;

  @ViewChild('actionsTemplateRef')
  actionsTemplateRef!: TemplateRef<any>;

  public dtOptions: ADTSettings = {};
  public dtTrigger: Subject<ADTSettings> = new Subject<ADTSettings>();

  private _projetos$!: Subscription;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService,
    private _currencyPipeInstance: CurrencyPipe,
    private _datePipeInstance: DatePipe
  ) {
    this._projetos$ = this._projetosService
      .getProjetos()
      .pipe(first())
      //Substituir por Observer
      .subscribe(
        (response: IProjectGet) => {
          this.dtOptions.data = response.content;
        },
        (error: HttpErrorResponse) => {
          if (error.status == 401) {
            alert('Sua token expirou. Faça o login novamente.');
            this._router.navigateByUrl('/login');
          }
        },
        () => {
          this.dtOptions.columns?.push({
            title: 'Ações',
            data: null,
            defaultContent: '',
            width: '150',
            ngTemplateRef: {
              ref: this.actionsTemplateRef,
              context: {
                captureEvents: this.actionEvent,
              },
            },
          });

          this.dtTrigger.next(this.dtOptions);
        }
      );
  }

  ngOnInit(): void {
    this.dtOptions = {
      searching: false,
      lengthChange: false,
      info: false,
      ordering: false, //Workaround para bug de sort com pipe aplicado
      language: {
        paginate: {
          first: 'Primeiro',
          last: 'Último',
          next: 'Próximo',
          previous: 'Anterior',
        },
      },
      columns: [
        { title: 'Sigla', data: 'sigla' },
        { title: 'Nome do Projeto', data: 'titulo' },
        { title: 'Microrregiões', data: 'nomesMicrorregioes' },
        {
          title: 'Valor',
          data: 'valorEstimado',
          ngPipeInstance: this._currencyPipeInstance,
          ngPipeArgs: ['BRL', 'symbol'],
        },
      ],
    };
  }

  // Mudar de lugar daqui pro componente breadcrumb
  redirectProjectForm(mode: string, projectId?: number) {
    this._router.navigate(['form', mode], {
      relativeTo: this._route,
      queryParams: !!projectId ? { id: projectId } : undefined,
    });
  }

  queryProject() {}

  projectDetails(data: any) {
    this._router.navigate(['form', 'details'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  projectEdit(data: any) {
    this._router.navigate(['form', 'edit'], {
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
      this._projetos$ = this._projetosService.deleteProjeto(data.id).subscribe(
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
    }
  }

  actionEvent(type: string, data: any) {
    switch (type) {
      case 'details':
        this.projectDetails(data);
        break;
      case 'edit':
        this.projectEdit(data);
        break;
      case 'delete':
        this.projectDelete(data);
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._projetos$.unsubscribe();
    this.dtTrigger.unsubscribe();
  }
}
