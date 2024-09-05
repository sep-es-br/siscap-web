import moedas from '../../../assets/data/moedas.json';

import { MoedaEnum } from '../enums/moeda.enum';

import { IMoeda } from '../interfaces/moeda.interface';

export abstract class MoedaHelper {
  public static moedasList(): Array<IMoeda> {
    let moedasList: Array<IMoeda> = [];

    for (const key in moedas) {
      const moeda = moedas[key as keyof typeof MoedaEnum];
      const moedaObj: IMoeda = {
        texto: moeda.texto,
        simbolo: moeda.simbolo,
        codigo: key,
      };

      moedasList.push(moedaObj);
    }

    return moedasList;
  }

  private static getMoeda(codigo: string): IMoeda {
    return moedas[codigo as keyof typeof MoedaEnum] as IMoeda;
  }

  public static getSimbolo(codigo: string): string {
    return this.getMoeda(codigo).simbolo;
  }

  public static getTexto(codigo: string): string {
    return this.getMoeda(codigo).texto;
  }
}
