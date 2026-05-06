import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { httpErrorMessage } from '../../core/http-error.util';
import { firstValueFrom, timeout } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row">
      <div class="card">
        <h2>Login</h2>
        <p class="muted">Use your username and password to access shipments.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" style="margin-top: 14px">
          <div class="field">
            <label>Username</label>
            <input formControlName="username" placeholder="e.g. demo" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••" />
          </div>

          @if (error()) {
            <div class="error" style="margin-bottom: 10px" role="alert">{{ error() }}</div>
          }

          <button class="btn primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Login' }}
          </button>
          <a class="btn" routerLink="/register" style="margin-left: 10px">Create account</a>
        </form>
      </div>
    </div>
  `
})
export class LoginPage {
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async submit() {
    this.error.set('');
    if (this.form.invalid) return;
    this.loading.set(true);

    try {
      const raw = this.form.getRawValue();
      const username = (raw.username ?? '').trim();
      const password = raw.password ?? '';

      if (!username || !password) {
        this.error.set('Username and password are required');
        return;
      }

      const res = await firstValueFrom(
        this.api.login(username, password).pipe(timeout({ first: 10000 }))
      );
      this.auth.setToken(res.token);
      await this.router.navigateByUrl('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { name?: string }).name === 'TimeoutError') {
        this.error.set('Login request timed out. Check backend is reachable.');
      } else {
        this.error.set(httpErrorMessage(err, 'Login failed'));
      }
    } finally {
      this.loading.set(false);
    }
  }
}
