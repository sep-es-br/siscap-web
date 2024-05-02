import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SweetAlertOptions } from 'sweetalert2';
import { Api, Config } from 'datatables.net';
import { Location } from '@angular/common';


@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() datatableConfig: Config = {};

  @Input() route: string = '/';

  // Reload emitter inside datatable
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

  public textDelete: string = 'Esta ação não poderá ser desfeita. Deseja continuar?';

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  swalOptions: SweetAlertOptions = { buttonsStyling: false };

  private modalRef!: NgbModalRef;

  private clickListener!: () => void;
  public nomeInAction!: string;

  constructor(private renderer: Renderer2, private router: Router, private modalService: NgbModal,private location: Location) { }

  ngOnInit(): void {
    let lastPage=0;
    let lastSearchText="";
    this.dtOptions = {
      dom: "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      processing: true,
      displayStart:lastPage,
      search:{search:lastSearchText},
      layout: {
        topStart: 'search',
        topEnd: undefined,
      },
      paging: true,
      language: {
        url:  `${this.router.parseUrl('/assets/plugins/datatable/translations/pt-BR.json')}`,
        processing: '<span class="spinner-border spinner-border-sm align-middle"></span> Carregando...'
      }, 
      ...this.datatableConfig,
      serverSide: true,
      searching: true, 
    };
    console.log("datatableConfig |||",this.datatableConfig);
    this.renderActionColumn();

    this.setupSweetAlert();

    if (this.reload) {
      this.reload.subscribe(data => {
        this.modalService.dismissAll();
        this.datatableElement.dtInstance.then((dtInstance: Api ) => dtInstance.ajax.reload());
      });
    }
  }

  renderActionColumn(): void {

    
    const actionColumn = {
      sortable: false,
      title: 'Gerenciar',

      render: (data: any, type: any, full: any) => {
        let editButton = '';
        let deleteButton = '';

        if (this.deleteEvent.observed) {
          deleteButton = `
          <button class="btn dropdown-item" data-action="delete" data-name="${full.nome}" data-id="${full.id}">
            <i class="ki-duotone ki-trash ">
              <span class="path1"></span><span class="path2"></span>
              <span class="path3"></span><span class="path4"></span><span class="path5"></span>
            </i>
            Excluir
          </button>`;
        }

        if (this.editEvent.observed) {
          editButton = `
          <button class="btn dropdown-item" data-action="edit" data-id="${full.id}">
            <i class="ki-duotone ki-pencil">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
            Editar
          </button>`;
        }
        

        const actionsDropdown = `
          <div class="btn-group">
            <button type="button" class="btn border-0 btn-icon btn-light-primary" data-bs-toggle="dropdown">
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
        console.log("Closest ",closestBtn.dataset);
        const { action, id, name } = closestBtn.dataset;
        this.idInAction = id;
        this.nomeInAction = name;
        // console.log("Nome",nonameme);
        this.textDelete = `Você está deletando o registro "<b>${name}</b>".<br>Esta ação não poderá ser desfeita. Deseja continuar?`;

        
           
       

        switch (action) {
          case 'view':
            this.router.navigate([`${this.route}/${id}`]);
            break;

          case 'create':
            this.createEvent.emit(true);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'edit':
            this.editEvent.emit(this.idInAction);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'delete':
            setTimeout(() => {
              console.log("Text",this.textDelete);
              this.deleteSwal.fire().then((clicked) => {
               if (clicked.isConfirmed) {
                 console.log('Sucesso');
               }
             });
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

  // adjustTextDelete(): void {
    
  // }

  triggerDelete() {
    this.deleteEvent.emit(this.idInAction);
  }

  triggerFilter() {
    fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(
        debounceTime(50),
        map(event => {
          const target = event.target as HTMLElement;
          const action = target.getAttribute('data-action');
          const value = (target as HTMLInputElement).value?.trim().toLowerCase();

          return { action, value };
        })
      )
      .subscribe(({ action, value }) => {
        if (action === 'filter') {
          this.datatableElement.dtInstance.then((dtInstance: Api ) => dtInstance.search(value).draw());
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
