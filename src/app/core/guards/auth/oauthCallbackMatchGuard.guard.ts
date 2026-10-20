
import { CanMatchFn } from '@angular/router';

export const oauthCallbackMatchGuard: CanMatchFn = () => {

    const fragmento = window.location.hash;

    if (!fragmento.startsWith('#')) {
        return false;
    }

    const parametros = new URLSearchParams(
        fragmento.substring(1)
    );

    return parametros.has('state') && (
        parametros.has('access_token') ||
        parametros.has('error')
    );
};
