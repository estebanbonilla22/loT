import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Shipment } from '../../core/api.types';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="row">
      <div class="card" style="flex: 2 1 600px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <h2 style="margin:0">Shipments</h2>
            <div class="muted">Refrigerated shipments being monitored</div>
          </div>
          @if (auth.isAdmin()) {
            <a class="btn primary" routerLink="/shipments/new">Create shipment</a>
          }
        </div>

        @if (loading) {
          <p class="muted" style="margin-top: 12px">Loading…</p>
        } @else {
          @if (shipments.length === 0) {
            <p class="muted" style="margin-top: 12px">No shipments yet. Create your first shipment.</p>
          } @else {
            <table class="table" style="margin-top: 12px">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Route</th>
                  <th>Temp range</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (s of shipments; track s.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/shipments', s.id]"><b>{{ s.productName }}</b></a>
                    </td>
                    <td>{{ s.origin }} → {{ s.destination }}</td>
                    <td>{{ s.minTemperature }}°C…{{ s.maxTemperature }}°C</td>
                    <td>
                      <span class="badge" [class.ok]="s.status==='OK'" [class.alert]="s.status==='ALERT'">
                        {{ s.status }}
                      </span>
                    </td>
                    <td class="muted">{{ s.createdAt | date: 'short' }}</td>
                    <td style="text-align:right">
                      @if (auth.isAdmin()) {
                        <button class="btn" type="button" (click)="remove(s)" [disabled]="deletingId===s.id">
                          {{ deletingId===s.id ? 'Deleting…' : 'Delete' }}
                        </button>
                      } @else {
                        <span class="muted">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }
      </div>

      <div class="card">
        <h3 style="margin-top:0">Live demo tips</h3>
        <ol class="muted">
          @if (auth.isAdmin()) {
            <li>Create a shipment with 2–8°C.</li>
            <li>Open the shipment detail page.</li>
            <li>Add a reading with temperature 20°C to trigger <b>ALERT</b>.</li>
          } @else {
            <li>You have <b>viewer</b> access: see shipments and temperature alerts.</li>
            <li>Ask an <b>administrator</b> to create shipments or add sensor readings.</li>
          }
        </ol>
      </div>
    </div>
  `
})
export class DashboardPage implements OnInit {
  loading = true;
  shipments: Shipment[] = [];
  deletingId: number | null = null;

  readonly auth = inject(AuthService);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.api.listShipments().subscribe({
      next: (res) => {
        this.shipments = res;
        this.loading = false;
      },
      error: (err) => {
        this.shipments = [];
        this.loading = false;
        console.error('listShipments', err);
      }
    });
  }

  remove(s: Shipment) {
    if (!confirm(`Delete shipment "${s.productName}"?`)) return;
    this.deletingId = s.id;
    this.api.deleteShipment(s.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.refresh();
      },
      error: (err) => {
        this.deletingId = null;
        console.error('deleteShipment', err);
        alert('Delete failed (admin only, or session expired)');
      }
    });
  }
}

