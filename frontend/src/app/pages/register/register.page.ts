import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { httpErrorMessage } from '../../core/http-error.util';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row">
      <div class="card">
        <h2>Register</h2>
        <p class="muted">
          New accounts are <b>viewers</b> (see shipments and alerts). Administrators create/delete data.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" style="margin-top: 14px">
          <div class="field">
            <label>Username</label>
            <input formControlName="username" placeholder="min 3 chars" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="min 6 chars" />
          </div>

          @if (error()) {
            <div class="error" style="margin-bottom: 10px" role="alert">{{ error() }}</div>
          }

          <button class="btn primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating…' : 'Register' }}
          </button>
          <a class="btn" routerLink="/login" style="margin-left: 10px">Back to login</a>
        </form>
      </div>
    </div>
  `
})
export class RegisterPage {
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  submit() {
    this.error.set('');
    if (this.form.invalid) return;
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    this.api.register(username!, password!).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.error.set(httpErrorMessage(err, 'Registration failed'));
        this.loading.set(false);
      }
    });
  }
}
