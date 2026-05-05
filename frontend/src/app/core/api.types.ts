export type ShipmentStatus = 'OK' | 'ALERT';

export interface Shipment {
  id: number;
  productName: string;
  origin: string;
  destination: string;
  minTemperature: number;
  maxTemperature: number;
  status: ShipmentStatus;
  createdAt: string;
}

export interface SensorReading {
  id: number;
  shipmentId: number;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
}

