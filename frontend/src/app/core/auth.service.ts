import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'coldchain_jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSig = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly token = computed(() => this.tokenSig());
  readonly isLoggedIn = computed(() => !!this.tokenSig());

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSig.set(token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSig.set(null);
  }
}

