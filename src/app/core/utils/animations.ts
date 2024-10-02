/**
 * Arquivo contento animações CSS para serem utilizadas nos arquivos '.ts' dos componentes.
 */

/**
 * Estremece o elemento para esquerda e para direita.
 * Utilizado para trazer a atenção do usuário para o elemento (geralmente em caso de erro).
 */
export const SIDEWAYS_SHAKE = {
  keyframes: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-0.75rem)' },
    { transform: 'translateX(0.75rem)' },
    { transform: 'translateX(-0.75rem)' },
    { transform: 'translateX(0)' },
  ],
  options: {
    duration: 200,
    iterations: 1,
  },
};
