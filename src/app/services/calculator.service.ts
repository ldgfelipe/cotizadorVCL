import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface UDIResult {
  valor_udi: number;
  fecha: string;
}

export interface INPCResult {
  inpc_venta: number;
  inpc_adquisicion: number;
}

export interface CotizacionDatos {
  fecha_venta: string;
  valor_escritura: number;
  porcentaje_enajenante: number;
  exenta: boolean;
  valor_terreno: number;
  valor_constr: number;
  fecha_adquisicion: string;
}

export interface ResultadoISR {
  base_gravable: number;
  isr_a_pagar: number;
  udi_usada: number;
  factor_ajuste: number;
  inpc_ratio: number;
}

export interface ConfigISR {
  limite_inferior: number;
  porcentaje_excedente: number;
  cuota_fija: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  private configISR: ConfigISR = {
    limite_inferior: 1800000,
    porcentaje_excedente: 0.30,
    cuota_fija: 518000
  };

  private inpcCache: Map<string, number> = new Map();

  constructor(private http: HttpClient) { }

  setConfigISR(config: Partial<ConfigISR>) {
    this.configISR = { ...this.configISR, ...config };
  }

  obtenerUDI(): Observable<UDIResult> {
    return this.http.get<UDIResult>('/api/banxico/udi', {
      params: { token: environment.banxicoApiKey }
    }).pipe(
      catchError(error => {
        console.warn('Usando UDI manual por fallo de API');
        return of({ valor_udi: 35.85, fecha: new Date().toISOString().split('T')[0] });
      })
    );
  }

  obtenerINPCHistorico(fecha: string): Observable<number> {
    const cacheKey = `inpc_${fecha}`;
    if (this.inpcCache.has(cacheKey)) {
      return of(this.inpcCache.get(cacheKey)!);
    }
    return this.http.get<{ inpc: number }>(`/api/banxico/inpc?fecha=${fecha}&token=${environment.banxicoApiKey}`).pipe(
      map(res => {
        this.inpcCache.set(cacheKey, res.inpc);
        return res.inpc;
      }),
      catchError(error => {
        console.warn('Usando INPC manual por fallo de API');
        return of(125.50); // Valor por defecto INPC 2024
      })
    );
  }

  calcularISR(baseGravable: number): number {
    if (baseGravable <= this.configISR.limite_inferior) {
      return 0;
    }
    const excedente = baseGravable - this.configISR.limite_inferior;
    return (excedente * this.configISR.porcentaje_excedente) + this.configISR.cuota_fija;
  }

  procesarCotizacion(datos: CotizacionDatos, creditos: number): Observable<{ resultado: ResultadoISR, creditosRestantes: number }> {
    return this.obtenerUDI().pipe(
      map(udi => this.calcularBaseGravable(datos, udi)),
      map(resultado => ({ ...resultado, creditosRestantes: creditos - 1 }))
    );
  }

  private calcularBaseGravable(datos: CotizacionDatos, udi: UDIResult): ResultadoISR {
    const { fecha_venta, valor_escritura, porcentaje_enajenante, exenta, valor_terreno, valor_constr, fecha_adquisicion } = datos;

    // Paso 1: Obtener UDI actual y cálculo base
    let baseCalculada = 0;
    if (exenta) {
      // Lógica exenta: 700,000 * Valor_UDI * %Enajenante
      baseCalculada = 700000 * udi.valor_udi * porcentaje_enajenante / 100;
    } else {
      // Lógica general (placeholder - se implementaría la lógica completa)
      baseCalculada = valor_escritura;
    }

    // Paso 2: Factor de ajuste por años (Costo de construcción * Factor tabla de ajuste)
    const factorAjuste = this.calcularFactorAjuste(fecha_adquisicion, fecha_venta);
    const valorConstruccionAjustado = valor_constr * factorAjuste;

    // Paso 3: Traer a valor presente (INPC ratio)
    const inpcRatio = await this.calcularRatioINPC(fecha_adquisicion, fecha_venta);
    const valorPresente = (valor_terreno + valorConstruccionAjustado) / inpcRatio;

    // Paso 4: Restar deducciones y exenciones para obtener base gravable
    const baseGravable = baseCalculada - valorPresente;

    // Paso 5: Aplicar tabla ISR
    const isr = this.calcularISR(Math.max(0, baseGravable));

    return {
      base_gravable: Math.max(0, baseGravable),
      isr_a_pagar: isr,
      udi_usada: udi.valor_udi,
      factor_ajuste: factorAjuste,
      inpc_ratio: inpcRatio
    };
  }

  private calcularFactorAjuste(fechaAdquisicion: string, fechaVenta: string): number {
    // Factor de tabla de ajuste por años
    // Simplified: factor = 1 / años (o usar tabla oficial del SAT)
    const años = new Date(fechaVenta).getFullYear() - new Date(fechaAdquisicion).getFullYear();
    return años > 0 ? Math.pow(0.95, años) : 1; // Factor de depreciación 5% anual
  }

  private async calcularRatioINPC(fechaAdquisicion: string, fechaVenta: string): Promise<number> {
    const inpcVenta = await this.obtenerINPCHistorico(fechaVenta).toPromise();
    const inpcAdq = await this.obtenerINPCHistorico(fechaAdquisicion).toPromise();
    return inpcVenta / inpcAdq;
  }
}