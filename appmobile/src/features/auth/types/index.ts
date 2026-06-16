export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly phone: string | null;
  readonly roles: readonly string[];
  readonly adminCountries: readonly string[];
  readonly providerCountries: readonly string[];
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly nombre: string;
  readonly email: string;
  readonly password: string;
  readonly telefono?: string;
}

export interface AuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
}

export interface RefreshResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}
