import {
  IProspeccao,
  IProspeccaoDetalhes,
  IProspeccaoOrganizacaoDetalhes,
  IProspeccaoForm,
  IProspeccaoInteressado,
} from '../interfaces/prospeccao.interface';

import { CartaConsultaDetalhesModel } from './carta-consulta.model';

export class ProspeccaoInteressadoModel implements IProspeccaoInteressado {
  public idInteressado: number;
  public emailInteressado: string;

  constructor(prospeccaoInteressado?: IProspeccaoInteressado) {
    this.idInteressado = prospeccaoInteressado?.idInteressado ?? 0;
    this.emailInteressado = prospeccaoInteressado?.emailInteressado ?? '';
  }
}

export class ProspeccaoOrganizacaoDetalhesModel
  implements IProspeccaoOrganizacaoDetalhes
{
  public nomeFantasia: string;
  public nome: string;
  public cidade: string;
  public estado: string;
  public pais: string;
  public telefone: string;
  public email: string;

  constructor(prospeccaoOrganizacaoDetalhes?: IProspeccaoOrganizacaoDetalhes) {
    this.nomeFantasia = prospeccaoOrganizacaoDetalhes?.nomeFantasia ?? '';
    this.nome = prospeccaoOrganizacaoDetalhes?.nome ?? '';
    this.cidade = prospeccaoOrganizacaoDetalhes?.cidade ?? '';
    this.estado = prospeccaoOrganizacaoDetalhes?.estado ?? '';
    this.pais = prospeccaoOrganizacaoDetalhes?.pais ?? '';
    this.telefone = prospeccaoOrganizacaoDetalhes?.telefone ?? '';
    this.email = prospeccaoOrganizacaoDetalhes?.email ?? '';
  }
}

export class ProspeccaoFormModel implements IProspeccaoForm {
  public idCartaConsulta: number;
  public idOrganizacaoProspectora: number;
  public idPessoaProspectora: number;
  public idOrganizacaoProspectada: number;
  public interessadosList: ProspeccaoInteressadoModel[];

  constructor(prospeccaoForm?: IProspeccaoForm) {
    this.idCartaConsulta = prospeccaoForm?.idCartaConsulta ?? 0;
    this.idOrganizacaoProspectora =
      prospeccaoForm?.idOrganizacaoProspectora ?? 0;
    this.idPessoaProspectora = prospeccaoForm?.idPessoaProspectora ?? 0;
    this.idOrganizacaoProspectada =
      prospeccaoForm?.idOrganizacaoProspectada ?? 0;
    this.interessadosList = this.construirInteressadosList(
      prospeccaoForm?.interessadosList
    );
  }

  private construirInteressadosList(
    interessadosList?: IProspeccaoInteressado[]
  ): ProspeccaoInteressadoModel[] {
    if (!interessadosList) return [];

    return interessadosList.map(
      (interessado) => new ProspeccaoInteressadoModel(interessado)
    );
  }
}

export class ProspeccaoModel
  extends ProspeccaoFormModel
  implements IProspeccao
{
  public readonly id: number;

  constructor(prospeccao?: IProspeccao) {
    super(prospeccao);
    this.id = prospeccao?.id ?? 0;
  }
}

export class ProspeccaoDetalhesModel implements IProspeccaoDetalhes {
  public readonly id: number;
  public organizacaoProspectoraDetalhes: ProspeccaoOrganizacaoDetalhesModel;
  public organizacaoProspectadaDetalhes: ProspeccaoOrganizacaoDetalhesModel;
  public nomesInteressados: string[];
  public tipoOperacao: string;
  public cartaConsultaDetalhes: CartaConsultaDetalhesModel;

  constructor(prospeccaoDetalhes?: IProspeccaoDetalhes) {
    this.id = prospeccaoDetalhes?.id ?? 0;
    this.organizacaoProspectoraDetalhes =
      new ProspeccaoOrganizacaoDetalhesModel(
        prospeccaoDetalhes?.organizacaoProspectoraDetalhes
      );
    this.organizacaoProspectadaDetalhes =
      new ProspeccaoOrganizacaoDetalhesModel(
        prospeccaoDetalhes?.organizacaoProspectadaDetalhes
      );
    this.nomesInteressados = prospeccaoDetalhes?.nomesInteressados ?? [];
    this.tipoOperacao = prospeccaoDetalhes?.tipoOperacao ?? '';
    this.cartaConsultaDetalhes = new CartaConsultaDetalhesModel(
      prospeccaoDetalhes?.cartaConsultaDetalhes
    );
  }
}
