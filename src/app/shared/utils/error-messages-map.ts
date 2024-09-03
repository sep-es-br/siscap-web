export abstract class ErrorMessageMap {
  public static readonly required: string = 'Campo obrigatório';
  public static readonly email: string = 'Email inválido';
  public static readonly maxlength: string = 'Tamanho acima do limite';
  public static readonly minlength: string = 'Tamanho abaixo do limite';
  public static readonly max: string = 'Valor superior ao limite';
  public static readonly min: string = 'Valor inferior ao limite';
  public static readonly cpf: string = 'CPF inválido';
  public static readonly rateioFormArrayVazio: string =
    'O rateio deve conter ao menos uma microrregião e uma cidade.';
  public static readonly rateioValoresIncompativeis: string =
    'Alguns valores não estão compatíveis. Por favor, verifique os campos do rateio.';
}