import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'coldchain_jwt';

function parseJwtPayload(token: string): { roles?: string[]; sub?: string } | null {
  try {
    const p = token.split('.')[1];
    const b64 = p.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as { roles?: string[]; sub?: string };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSig = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly token = computed(() => this.tokenSig());
  readonly isLoggedIn = computed(() => !!this.tokenSig());

  readonly roles = computed(() => {
    const t = this.tokenSig();
    if (!t) return [] as string[];
    return parseJwtPayload(t)?.roles ?? [];
  });

  readonly isAdmin = computed(() => this.roles().includes('ROLE_ADMIN'));

  /** Etiqueta corta para la barra superior */
  readonly roleLabel = computed(() => (this.isAdmin() ? 'Administrator' : 'Viewer'));

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSig.set(token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSig.set(null);
  }
}
