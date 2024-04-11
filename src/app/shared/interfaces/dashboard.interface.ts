export interface ISupersetLoginRequestBody {
  password: string;
  provider: string;
  refresh: boolean;
  username: string;
}

export interface ISupersetLoginResponseBody {
  access_token: string;
  refresh_token?: string;
}

export interface ISupersetGuestTokenRequestBody {
  resources: Array<{ id: string; type: string }>;
  rls: Array<{ clause: string; dataset: number }>;
  user: { first_name: string; last_name: string; username: string };
}

export interface ISupersetGuestTokenResponseBody {
  token: string;
}


/* 
- Posicionar titulo na parte inferior
- Alinhar conteúdo no meio do card
*/