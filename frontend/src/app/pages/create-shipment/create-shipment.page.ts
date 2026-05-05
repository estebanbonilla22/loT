import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { timeout } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-create-shipment-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="row">
      <div class="card">
        <h2>Create shipment</h2>
        <p class="muted">Define the product, route, and safe temperature range.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" style="margin-top: 14px">
          <div class="row">
            <div class="field">
              <label>Product name</label>
              <input formControlName="productName" placeholder="e.g. Vaccines" />
            </div>
            <div class="field">
              <label>Origin</label>
              <input formControlName="origin" placeholder="e.g. Bogotá" />
            </div>
            <div class="field">
              <label>Destination</label>
              <input formControlName="destination" placeholder="e.g. Medellín" />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>Min temperature (°C)</label>
              <input type="number" formControlName="minTemperature" />
            </div>
            <div class="field">
              <label>Max temperature (°C)</label>
              <input type="number" formControlName="maxTemperature" />
            </div>
          </div>

          @if (error) { <div class="error" style="margin-bottom: 10px">{{ error }}</div> }

          <button class="btn primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creating…' : 'Create shipment' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class CreateShipmentPage {
  loading = false;
  error = '';

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    productName: ['', [Validators.required]],
    origin: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    minTemperature: [2, [Validators.required]],
    maxTemperature: [8, [Validators.required]]
  });

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.getRawValue();
    this.api.createShipment({
      productName: v.productName!,
      origin: v.origin!,
      destination: v.destination!,
      minTemperature: Number(v.minTemperature),
      maxTemperature: Number(v.maxTemperature)
    }).pipe(
      timeout({ first: 10000 })
    ).subscribe({
      next: (shipment) => {
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        if (err?.name === 'TimeoutError') {
          this.error = 'Backend not responding. Check Docker backend is up on http://localhost:8082.';
        } else {
          this.error = err?.error?.error ?? 'Create shipment failed';
        }
        this.loading = false;
      }
    });
  }
}

