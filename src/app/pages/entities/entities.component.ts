import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntidadesService } from '../../shared/services/entidades/entidades.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-entities',
  standalone: false,
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.css',
})
export class EntitiesComponent {
  // public entidadesList: Array<any> = [];
  // constructor(
  //   private _router: Router,
  //   private _route: ActivatedRoute,
  //   private _entidadesService: EntidadesService
  // ) {
  //   this._entidadesService
  //     .getEntidades()
  //     .pipe(first())
  //     .subscribe((response) => {
  //       this.entidadesList = response.content;
  //     });
  // }
  // queryEntity() {}
  // entityDetails(data: any) {
  //   this._router.navigate(['form', 'detalhes'], {
  //     relativeTo: this._route,
  //     queryParams: { id: data.id },
  //   });
  // }
  // entityEdit(data: any) {
  //   this._router.navigate(['form', 'editar'], {
  //     relativeTo: this._route,
  //     queryParams: { id: data.id },
  //   });
  // }
  // entityDelete(data: any) {
  //   if (
  //     // Trocar texto de 'usuario' para 'entidade'
  //     confirm(`
  //           Tem certeza que deseja deletar o usuário?
  //           Nome: ${data.nome}
  //           E-mail: ${data.email}
  //           `)
  //   ) {
  //     this._entidadesService.deleteEntidade(data.id).subscribe(
  //       (response) => {
  //         console.log(response);
  //         if (response) {
  //           alert('Usuário excluido com sucesso.');
  //         }
  //       },
  //       (err) => {},
  //       () => {
  //         this._router
  //           .navigateByUrl('/', { skipLocationChange: true })
  //           .then(() => this._router.navigate(['main', 'pessoas']));
  //       }
  //     );
  //   }
  // }
  // actionEvent(type: string, data: any) {
  //   switch (type) {
  //     case 'detalhes':
  //       this.entityDetails(data);
  //       break;
  //     case 'editar':
  //       this.entityEdit(data);
  //       break;
  //     case 'deletar':
  //       this.entityDelete(data);
  //       break;
  //     default:
  //       break;
  //   }
  // }
}
