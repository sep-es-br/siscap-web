import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SweetAlertOptions } from 'sweetalert2';
import { Api, Config } from 'datatables.net';
import { PermissionsMap } from '../../../shared/interfaces/profile.interface';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() datatableConfig: Config = {};

  @Input() route: string = '/';

  @Input() reload!: EventEmitter<boolean>;

  @Input() modal!: TemplateRef<any>;

  @Output() deleteEvent = new EventEmitter<number>();
  @Output() editEvent = new EventEmitter<number>();
  @Output() createEvent = new EventEmitter<boolean>();

  dtOptions: Config = {};

  @ViewChild(DataTableDirective, { static: false })
  private datatableElement!: DataTableDirective;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  private idInAction!: number;

  public textDelete: string =
    'Esta ação não poderá ser desfeita. Deseja continuar?';

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  swalOptions: SweetAlertOptions = { buttonsStyling: false };

  private modalRef!: NgbModalRef;

  private clickListener!: () => void;
  public nomeInAction!: string;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    let lastPage = 0;
    let lastSearchText = '';
    this.dtOptions = {
      dom:
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      processing: true,
      displayStart: lastPage,
      search: { search: lastSearchText },
      layout: {
        topStart: 'search',
        topEnd: undefined,
      },
      paging: true,
      language: {
        url: `${this.router.parseUrl(
          '/assets/plugins/datatable/translations/pt-BR.json'
        )}`,
        processing:
          '<span class="spinner-border spinner-border-sm align-middle"></span> Carregando...',
      },
      ...this.datatableConfig,
      serverSide: true,
      searching: true,
      rowId: 'id',
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $(row).on('click', 'td:not(:last-child)', () => {
          const rowData = data as any;
          this.router.navigate([`${this.router.url}/form/editar`], {
            queryParams: { id: rowData?.id },
          });
        });
        return row;
      },
    };

    this.validateRenderActionColumn();

    this.setupSweetAlert();

    if (this.reload) {
      this.reload.subscribe(() => {
        this.modalService.dismissAll();
        this.datatableElement.dtInstance.then((dtInstance: Api) =>
          dtInstance.ajax.reload()
        );
      });
    }
  }

  private validateRenderActionColumn() {
    const userPermissions: Array<string> =
      JSON.parse(sessionStorage.getItem('user-profile')!).permissoes ?? [];
    const route = this.router.url.replaceAll('/main/', '');
    const isAdmin = userPermissions.includes(
      PermissionsMap['adminAuth' as keyof typeof PermissionsMap]
    );
    const canEdit = userPermissions.includes(
      PermissionsMap[(route + 'editar') as keyof typeof PermissionsMap]
    );
    if (isAdmin || canEdit) this.renderActionColumn(isAdmin, canEdit);
  }

  renderActionColumn(isAdmin: boolean, canEdit: boolean): void {
    const actionColumn = {
      sortable: false,
      title: 'Ações',

      render: (data: any, type: any, full: any) => {
        let editButton = '';
        let deleteButton = '';

        if (this.deleteEvent.observed && isAdmin) {
          deleteButton = `
          <button class="btn dropdown-item" data-action="delete" data-name="${full[this.targetNameMap()]}" data-id="${full.id}">
            <i class="fa-regular fa-trash-can me-1"></i>
            Excluir
          </button>`;
        }

        if (this.editEvent.observed && (isAdmin || canEdit)) {
          editButton = `
          <button class="btn dropdown-item" data-action="edit" data-id="${full.id}">
            <i class="fa-regular fa-pen-to-square fs-6 me-1"></i>
            Editar
          </button>`;
        }

        const actionsDropdown = `
          <div class="btn-group">
            <button type="button" class="btn btn-light-primary" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
               ${editButton}
               ${deleteButton}
            </div>
          </div>`;

        const buttons = [];
        buttons.push(actionsDropdown);

        return buttons.join('');
      },
    };

    if (this.dtOptions.columns) {
      this.dtOptions.columns.push(actionColumn);
    }
  }

  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id, name } = closestBtn.dataset;
        this.idInAction = id;
        this.nomeInAction = name;
        this.textDelete = 
          "Você está deletando o seguinte registro:" +
          "<br/ ><br />" +
          `<b>${name}</b>` +
          "<br/ ><br />" +
          "Esta ação não poderá ser desfeita. Deseja continuar?";

        switch (action) {
          case 'view':
            this.router.navigate([`${this.route}/${id}`]);
            break;

          case 'create':
            this.createEvent.emit(true);
            this.modalRef = this.modalService.open(
              this.modal,
              this.modalConfig
            );
            break;

          case 'edit':
            this.editEvent.emit(this.idInAction);
            this.modalRef = this.modalService.open(
              this.modal,
              this.modalConfig
            );
            break;

          case 'delete':
            setTimeout(() => {
              this.deleteSwal.fire();
            }, 0);
            break;
        }
      }
    });

    this.triggerFilter();
  }

  ngOnDestroy(): void {
    if (this.reload) {
      this.reload.unsubscribe();
    }
    if (this.clickListener) {
      this.clickListener();
    }
    this.modalService.dismissAll();
  }

  private targetNameMap(): string {
    const targetRoute = this.router.url.split('/').pop();

    switch (targetRoute) {
      case 'projetos':
        return 'titulo';
      case 'pessoas':
        return 'nome';
      case 'organizacoes':
        return 'nome';
      default:
        return '';
    }
  }

  triggerDelete() {
    this.deleteEvent.emit(this.idInAction);
  }

  triggerFilter() {
    fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(
        debounceTime(50),
        map((event) => {
          const target = event.target as HTMLElement;
          const action = target.getAttribute('data-action');
          const value = (target as HTMLInputElement).value
            ?.trim()
            .toLowerCase();

          return { action, value };
        })
      )
      .subscribe(({ action, value }) => {
        if (action === 'filter') {
          this.datatableElement.dtInstance.then((dtInstance: Api) =>
            dtInstance.search(value).draw()
          );
        }
      });
  }

  setupSweetAlert() {
    this.swalOptions = {
      buttonsStyling: false,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Não, manter',
    };
  }
}
