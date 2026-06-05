import { SetMetadata } from '@nestjs/common';

/**
 * Marca un handler para que el SerializeInterceptor NO filtre el `refreshToken`
 * de la respuesta. Necesario en los endpoints de autenticación, que deben
 * entregar el refresh token al cliente. `password`/`passwordHash` se siguen
 * filtrando siempre (defensa en profundidad).
 */
export const EXPOSE_TOKENS_KEY = 'exposeTokens';
export const ExposeTokens = (): MethodDecorator & ClassDecorator =>
    SetMetadata(EXPOSE_TOKENS_KEY, true);
