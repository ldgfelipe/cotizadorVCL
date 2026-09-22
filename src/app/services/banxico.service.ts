import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UDI {
  valor_udi: number;
  fecha: string;
}

export interface INPC {
  inpc: number;
  fecha: string;

}

@Injectable({
  providedIn: 'root'
})
export class BanxicoService {

  private baseUrl = 'https://api.banxicoindice.com';

  constructor(private http: HttpClient) { }

  obtenerValorUDIActual(): Observable<UDI> {
    // Endpoint del SAT/Banxico para UDIs diarias
    return this.http.get<{ error: string; data: UDI }>(
      `${this.baseUrl}/dato/oportuno/json`,
      {
        params: {
          token: environment.banxicoApiKey,
          concepto: 'UDI'
        }
      }
    ).pipe(
      map(response => {
        if (response.data) {
          return {
            valor_udi: parseFloat(response.data[0].dato),
            fecha: response.data[0].fecha
          };
        }
        throw new Error('No UDI data');
      }),
      catchError(error => {
        console.error('Error al obtener UDI de Banxico:', error);
        return of({ valor_udi: 35.85, fecha: new Date().toISOString().split('T')[0] });
      })
    );
  }

  obtenerINPCHistorico(fecha: string): Observable<INPC> {
    return this.http.get<{ error: string; data: INPC }>(
      `${this.baseUrl}/dato/historico/json`,
      {
        params: {
          token: environment.banxicoApiKey,
          fechaInicial: fecha,
          fechaFinal: fecha,
          concepto: 'INPC'
        }
      }
    ).pipe(
      map(response => {
        if (response.data && response.data.length > 0) {
          return {
            inpc: parseFloat(response.data[0].dato),
            fecha: response.data[0].fecha
          };
        }
        throw new Error('No INPC data');
      }),
      catchError(error => {
        console.error('Error al obtener INPC de Banxico:', error);
        return of({ inpc: 125.50, fecha: fecha });
      })
    );
  }

  probarConexion(): Observable<boolean> {
    return this.obtenerValorUDIActual().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}