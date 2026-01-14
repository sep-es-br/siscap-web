
export enum FasesEdocsIntegracaoEnum {
  captura_assinatura = 'CAPTURAASSINA',
  autuar = 'AUTUAR',
  entranhararquivo = 'ENTRANHARARQUIVO',
  despacharprocesso = 'DESPACHARPROCESSO',
  erro_fase = 'ERROFASE',
  desentranhamento = 'DESENTRANHAR',
  avocamento = 'AVOCAR'
}

export enum FaseStatuEnum {
  NAO_INICIADA,
  EM_ANDAMENTO,
  FINALIZADA,
  ERROFASE
}
