import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

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

          @if (error) { <div class="error" style="margin-bottom: 10px">{{ error }}</div> }

          <button class="btn primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Login' }}
          </button>
          <a class="btn" routerLink="/register" style="margin-left: 10px">Create account</a>
        </form>
      </div>
    </div>
  `
})
export class LoginPage {
  loading = false;
  error = '';

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

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;

    const { username, password } = this.form.getRawValue();
    this.api.login(username!, password!).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Login failed';
        this.loading = false;
      }
    });
  }
}

