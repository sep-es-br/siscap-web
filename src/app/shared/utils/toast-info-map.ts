interface IToastComponentInfo {
  header: string;
  body: string;
}

type ToastErrorInfo = {
  [code: number]: IToastComponentInfo;
};

type ToastSuccessInfo = {
  [source: string]: { [method: string]: Pick<IToastComponentInfo, 'body'> };
};

export const ToastErrorInfoMap: ToastErrorInfo = {
  401: {
    header: 'Erro 401 - Não Autorizado',
    body: 'A token de autenticação não é válida. O sistema será redirecionado para a página de login para tentar a autenticação novamente. Ao completar o processo, você retornará para a página que estava anteriormente.',
  },
  500: {
    header: 'Erro 500 - Erro Interno de Servidor',
    body: 'Houve um problema ao tentar processar a requisição. Por favor, contate a equipe técnica da aplicação.',
  },
};

export const ToastSuccessInfoMap: ToastSuccessInfo = {
  Projeto: {
    POST: { body: 'Projeto cadastrado com sucesso.' },
    PUT: { body: 'Projeto atualizado com sucesso.' },
    DELETE: { body: 'Projeto excluído com sucesso.' },
  },
  Pessoa: {
    POST: { body: 'Pessoa cadastrada com sucesso.' },
    PUT: { body: 'Pessoa atualizada com sucesso.' },
    DELETE: { body: 'Pessoa excluída com sucesso.' },
  },
  Organização: {
    POST: { body: 'Organização cadastrada com sucesso.' },
    PUT: { body: 'Organização atualizada com sucesso.' },
    DELETE: { body: 'Organização excluída com sucesso.' },
  },
};
