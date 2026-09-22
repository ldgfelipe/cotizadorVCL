import { Injectable, ElementRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PayPalService {

  paypalScriptLoaded = false;

  constructor() {
    if (!this.paypalScriptLoaded) {
      this.loadPayPalScript();
      this.paypalScriptLoaded = true;
    }
  }

  private get paypalBaseUrl(): string {
    const mode = environment.paypalMode || 'production';
    return mode === 'sandbox'
      ? 'https://www.sandbox.paypal.com/api'
      : 'https://www.paypal.com/api';
  }

  private get paypalScriptUrl(): string {
    const mode = environment.paypalMode || 'production';
    return mode === 'sandbox'
      ? 'https://www.sandbox.paypal.com/javascript/v2/checkout.js'
      : 'https://www.paypal.com/javascript/v2/checkout.js';
  }

  private loadPayPalScript(): void {
    const script = document.createElement('script');
    script.src = this.paypalScriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log(`SDK de PayPal ${environment.paypalMode || 'production'} cargado`);
    };
    script.onerror = (err) => {
      console.error('Error cargando SDK de PayPal:', err);
    };
    document.body.appendChild(script);
  }

  pagar(monto: number): void {
    if (!window.PayPal || !window.PayPal.Buttons) {
      console.error('SDK de PayPal no cargado');
      return;
    }

    window.PayPal.Buttons({
      client: {
        // Usar client_id según modo
        paypal: environment.paypalClientId || '',
        sandbox: environment.paypalMode === 'sandbox' ? '' : undefined
      },
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
          console.log('Pago completado:', capture.id);
          alert('¡Pago exitoso! Créditos agregados.');
          // TODO: Llamar a Edge Function para sumar créditos
        });
      },
      onError: (err: any) => {
        console.error('Error en pago PayPal:', err);
        alert('Error al procesar el pago');
      }
    }).render('#paypal-button-container');
  }
}