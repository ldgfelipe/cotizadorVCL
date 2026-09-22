import { Injectable, ElementRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PayPalService {

  paypalScriptLoaded = false;

  constructor() {
    // Cargar SDK de PayPal
    if (!this.paypalScriptLoaded) {
      this.loadPayPalScript();
      this.paypalScriptLoaded = true;
    }
  }

  private loadPayPalScript(): void {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/javascript/v2/checkout.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('SDK de PayPal cargado');
    };
    document.body.appendChild(script);
  }

  pagar(monto: number): void {
    if (!window.PayPal || !window.PayPal.Buttons) {
      console.error('SDK de PayPal no cargado');
      return;
    }

    window.PayPal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: monto.toString(),
              currency_code: 'USD'
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((capture: any) => {
          // Llamar a Edge Function o servicio para sumar créditos
          // TODO: Llamar a Supabase Function o endpoint
          console.log('Pago completado:', capture.id);
          alert('¡Pago exitoso! Créditos agregados.');
        });
      },
      onError: (err: any) => {
        console.error('Error en pago PayPal:', err);
        alert('Error al procesar el pago');
      }
    }).render('#paypal-button-container');
  }
}