import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { SensorReading, Shipment } from '../../core/api.types';

@Component({
  standalone: true,
  selector: 'app-shipment-detail-page',
  imports: [CommonModule, RouterLink, DatePipe, ReactiveFormsModule],
  template: `
    @if (loadError) {
      <div class="card">
        <div class="muted"><a routerLink="/dashboard">← Back</a></div>
        <h2>Could not load shipment</h2>
        <p class="error">{{ loadError }}</p>
        <p class="muted" style="margin-top:10px">Tip: make sure you are logged in and backend is reachable.</p>
      </div>
    } @else if (!shipment) {
      <p class="muted">Loading…</p>
    } @else {
      <div class="row">
        <div class="card" style="flex:2 1 600px">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
            <div>
              <div class="muted"><a routerLink="/dashboard">← Back</a></div>
              <h2 style="margin: 6px 0 0">{{ shipment.productName }}</h2>
              <div class="muted">{{ shipment.origin }} → {{ shipment.destination }}</div>
              <div style="margin-top: 10px">
                <span class="badge" [class.ok]="shipment.status==='OK'" [class.alert]="shipment.status==='ALERT'">
                  {{ shipment.status }}
                </span>
                <span class="muted" style="margin-left: 10px">
                  Safe range: {{ shipment.minTemperature }}°C…{{ shipment.maxTemperature }}°C
                </span>
              </div>
            </div>
            <div class="muted">Created: {{ shipment.createdAt | date:'short' }}</div>
          </div>

          <h3 style="margin: 16px 0 10px">Sensor readings</h3>
          @if (readingsLoading) {
            <p class="muted">Loading readings…</p>
          } @else {
            @if (readings.length === 0) {
              <p class="muted">No readings yet. Add one on the right.</p>
            } @else {
              <table class="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Temp</th>
                    <th>Humidity</th>
                    <th>Lat</th>
                    <th>Lng</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of readings; track r.id) {
                    <tr>
                      <td class="muted">{{ r.timestamp | date:'short' }}</td>
                      <td>
                        <b [style.color]="tempColor(r.temperature)">
                          {{ r.temperature }}°C
                        </b>
                      </td>
                      <td>{{ r.humidity }}%</td>
                      <td class="muted">{{ r.latitude }}</td>
                      <td class="muted">{{ r.longitude }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          }
        </div>

        <div class="card">
          <h3 style="margin-top:0">Add sensor reading</h3>
          <p class="muted">If temperature is out of range, shipment becomes <b>ALERT</b>.</p>

          <form [formGroup]="form" (ngSubmit)="addReading()" style="margin-top: 12px">
            <div class="field">
              <label>Temperature (°C)</label>
              <input type="number" formControlName="temperature" />
            </div>
            <div class="field">
              <label>Humidity (%)</label>
              <input type="number" formControlName="humidity" />
            </div>
            <div class="field">
              <label>Latitude</label>
              <input type="number" formControlName="latitude" />
            </div>
            <div class="field">
              <label>Longitude</label>
              <input type="number" formControlName="longitude" />
            </div>

            @if (error) { <div class="error" style="margin-bottom: 10px">{{ error }}</div> }

            <button class="btn primary" type="submit" [disabled]="form.invalid || adding">
              {{ adding ? 'Adding…' : 'Add reading' }}
            </button>
          </form>
        </div>
      </div>
    }
  `
})
export class ShipmentDetailPage implements OnInit, OnDestroy {
  shipment: Shipment | null = null;
  readings: SensorReading[] = [];
  readingsLoading = true;
  adding = false;
  error = '';
  loadError = '';
  private sub?: Subscription;

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    temperature: [5, [Validators.required]],
    humidity: [60, [Validators.required]],
    latitude: [4.6, [Validators.required]],
    longitude: [-74.1, [Validators.required]]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      this.load(id);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private load(id: number) {
    this.shipment = null;
    this.readings = [];
    this.readingsLoading = true;
    this.loadError = '';

    if (!Number.isFinite(id)) {
      this.readingsLoading = false;
      this.loadError = 'Invalid shipment id in URL.';
      return;
    }

    this.api.getShipment(id).subscribe({
      next: (s) => {
        this.shipment = s;
        this.refreshReadings();
      },
      error: (err) => {
        this.shipment = null;
        this.readingsLoading = false;
        this.loadError = err?.error?.error ?? 'Request failed (check token/CORS/backend).';
      }
    });
  }

  private refreshReadings() {
    if (!this.shipment) return;
    this.readingsLoading = true;
    this.api.listReadings(this.shipment.id).subscribe({
      next: (r) => {
        this.readings = r;
        this.readingsLoading = false;
      },
      error: () => {
        this.readings = [];
        this.readingsLoading = false;
      }
    });
  }

  addReading() {
    this.error = '';
    if (!this.shipment || this.form.invalid) return;
    this.adding = true;
    const v = this.form.getRawValue();
    this.api.addReading({
      shipmentId: this.shipment.id,
      temperature: Number(v.temperature),
      humidity: Number(v.humidity),
      latitude: Number(v.latitude),
      longitude: Number(v.longitude)
    }).subscribe({
      next: () => {
        this.adding = false;
        this.api.getShipment(this.shipment!.id).subscribe((s) => (this.shipment = s));
        this.refreshReadings();
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Add reading failed';
        this.adding = false;
      }
    });
  }

  tempColor(t: number) {
    if (!this.shipment) return 'inherit';
    if (t < this.shipment.minTemperature || t > this.shipment.maxTemperature) return '#fca5a5';
    return '#86efac';
  }
}

