
export enum FasesEdocsIntegracaoEnum {
  captura_assinatura = 'CAPTURAASSINA',
  autuar = 'AUTUAR',
  entranhararquivo = 'ENTRANHARARQUIVO',
  despacharprocesso = 'DESPACHARPROCESSO',
  erro_fase = 'ERROFASE',
  desentranhamento = 'DESENTRANHAMENTO',
  avocamento = 'AVOCAMENTO'
}

export enum FaseStatuEnum {
  NAO_INICIADA,
  EM_ANDAMENTO,
  FINALIZADA,
  ERROFASE
}
