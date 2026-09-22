import { Component } from '@angular/core';
import { PayPalService } from '../services/paypal.service';

@Component({
  selector: 'app-credits',
  template: `
    <div class="max-w-md mx-auto py-12">
      <h2 class="text-2xl font-bold mb-6">Comprar Créditos</h2>
      <div class="grid grid-cols-2 gap-4">
        <div *ngFor="let paquete of paquetes" class="p-4 border rounded hover:border-blue-500">
          <h3>{{ paquete.nombre }}</h3>
          <p>{{ paquete.descripcion }}</p>
          <p class="text-xl font-bold">${{ paquete.precio }}</p>
          <button (click)="comprar(paquete)" class="w-full py-2 bg-green-600 text-white mt-2 rounded">Comprar</button>
        </div>
      </div>
    </div>
  `
})
export class CreditsComponent {
  paquetes = [
    { nombre: 'Paquete Básico', descripcion: '5 cotizaciones', precio: 10 },
    { nombre: 'Paquete Profesional', descripcion: '20 cotizaciones', precio: 35 },
    { nombre: 'Paquete Enterprise', descripcion: '50 cotizaciones', precio: 80 }
  ];

  constructor(public paypal: PayPalService) {}

  comprar(paquete: any) {
    this.paypal.pagar(paquete.precio);
  }
}