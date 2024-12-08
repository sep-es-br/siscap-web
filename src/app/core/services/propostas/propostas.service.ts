import { Injectable } from '@angular/core';
import { PropostaFormModel, PropostaModel } from '../../models/proposta.model';
import { ProjetoFormModel, ProjetoModel } from '../../models/projeto.model';
import { RateioModel } from '../../models/rateio.model';
import { ValorModel } from '../../models/valor.model';
import { TipoValorEnum } from '../../enums/tipo-valor.enum';

@Injectable({
  providedIn: 'root',
})
export class PropostasService {
  public converterPropostaFormModelParaProjetoFormModel(
    propostaFormModel: PropostaFormModel
  ): ProjetoFormModel {
    const rateioModelArray = this.construirRateioModelArray(
      propostaFormModel.idMicrorregioesList,
      propostaFormModel.valorEstimado
    );

    const valorModel = this.construirValorModel(
      propostaFormModel.valorEstimado
    );

    const projetoFormModel = new ProjetoFormModel();
    projetoFormModel.sigla = propostaFormModel.sigla;
    projetoFormModel.titulo = propostaFormModel.titulo;
    projetoFormModel.idOrganizacao = propostaFormModel.idOrganizacao;
    projetoFormModel.valor = valorModel;
    projetoFormModel.rateio = rateioModelArray;
    projetoFormModel.objetivo = propostaFormModel.objetivo;
    projetoFormModel.objetivoEspecifico = propostaFormModel.objetivoEspecifico;
    projetoFormModel.situacaoProblema = propostaFormModel.situacaoProblema;
    projetoFormModel.solucoesPropostas = propostaFormModel.solucoesPropostas;
    projetoFormModel.impactos = propostaFormModel.impactos;
    projetoFormModel.arranjosInstitucionais =
      propostaFormModel.arranjosInstitucionais;
    projetoFormModel.idResponsavelProponente =
      propostaFormModel.idResponsavelProponente;
    projetoFormModel.equipeElaboracao = propostaFormModel.equipeElaboracao;

    return projetoFormModel;
  }

  public converterProjetoModelParaPropostaModel(
    projetoModel: ProjetoModel
  ): PropostaModel {
    const idMicrorregioesList = this.construirIdMicrorregioesList(
      projetoModel.rateio
    );

    const valorEstimado = this.construirValorEstimado(projetoModel.valor);

    const propostaModel = new PropostaModel();
    propostaModel.sigla = projetoModel.sigla;
    propostaModel.titulo = projetoModel.titulo;
    propostaModel.idOrganizacao = projetoModel.idOrganizacao;
    propostaModel.valorEstimado = valorEstimado;
    propostaModel.idMicrorregioesList = idMicrorregioesList;
    propostaModel.objetivo = projetoModel.objetivo;
    propostaModel.objetivoEspecifico = projetoModel.objetivoEspecifico;
    propostaModel.situacaoProblema = projetoModel.situacaoProblema;
    propostaModel.solucoesPropostas = projetoModel.solucoesPropostas;
    propostaModel.impactos = projetoModel.impactos;
    propostaModel.arranjosInstitucionais = projetoModel.arranjosInstitucionais;
    propostaModel.idResponsavelProponente =
      projetoModel.idResponsavelProponente;
    propostaModel.equipeElaboracao = projetoModel.equipeElaboracao;

    return propostaModel;
  }

  private construirRateioModelArray(
    idMicrorregioesList: Array<number>,
    valorEstimado: number
  ): Array<RateioModel> {
    const percentualPorLocalidade = 100 / idMicrorregioesList.length;
    const quantiaPorLocalidade = valorEstimado / idMicrorregioesList.length;

    return idMicrorregioesList.map((idLocalidade) => {
      return new RateioModel({
        idLocalidade,
        percentual: percentualPorLocalidade,
        quantia: quantiaPorLocalidade,
      });
    });
  }

  private construirIdMicrorregioesList(
    rateioModelArray: Array<RateioModel>
  ): Array<number> {
    return rateioModelArray.map((rateio) => rateio.idLocalidade);
  }

  private construirValorModel(valorEstimado: number): ValorModel {
    const tipoValor = TipoValorEnum.Estimado;
    const moedaValor = 'BRL';

    return new ValorModel({
      tipo: tipoValor,
      moeda: moedaValor,
      quantia: valorEstimado,
    });
  }

  private construirValorEstimado(valorModel: ValorModel): number {
    return valorModel.quantia;
  }
}
