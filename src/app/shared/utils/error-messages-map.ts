export abstract class ErrorMessageMap {
  public static readonly required: string = 'Campo obrigatório';
  public static readonly email: string = 'Email inválido';
  public static readonly maxlength: string = 'Tamanho acima do limite';
  public static readonly minlength: string = 'Tamanho abaixo do limite';
  public static readonly max: string = 'Valor superior ao limite';
  public static readonly min: string = 'Valor inferior ao limite';
  public static readonly cpf: string = 'CPF inválido';
  public static readonly limiteRateio: string =
    'Alguns valores ultrapassam os limites. Por favor, verifique os valores do rateio.';
}
