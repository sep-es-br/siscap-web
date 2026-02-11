import { TipoEquipeEnum } from '../enums/tipo-equipe.enum';
import { IAcao } from './acoes.interface';
import { IEquipe } from './equipe.interface';
import { IIndicadores } from './indicadores.interface';
import { IRateio } from './rateio.interface';
import { IValor } from './valor.interface';

export interface IProjetoIntegracaoEdocsFases {
  readonly id: number;
  readonly etapa: string;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly msgAlertaExibir: string;
  readonly contextoNegocio: string;
}


