import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, SensorReading, Shipment } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  register(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/register`, { username, password });
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, { username, password });
  }

  listShipments() {
    return this.http.get<Shipment[]>(`${this.base}/api/shipments`);
  }

  getShipment(id: number) {
    return this.http.get<Shipment>(`${this.base}/api/shipments/${id}`);
  }

  createShipment(payload: {
    productName: string;
    origin: string;
    destination: string;
    minTemperature: number;
    maxTemperature: number;
  }) {
    return this.http.post<Shipment>(`${this.base}/api/shipments`, payload);
  }

  deleteShipment(id: number) {
    return this.http.delete<void>(`${this.base}/api/shipments/${id}`);
  }

  listReadings(shipmentId: number) {
    return this.http.get<SensorReading[]>(`${this.base}/api/readings`, { params: { shipmentId } });
  }

  addReading(payload: {
    shipmentId: number;
    temperature: number;
    humidity: number;
    latitude: number;
    longitude: number;
    timestamp?: string;
  }) {
    return this.http.post<SensorReading>(`${this.base}/api/readings`, payload);
  }
}

