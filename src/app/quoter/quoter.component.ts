import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../services/calculator.service';
import { BanxicoService } from '../services/banxico.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-quoter',
  template: `
    <div class="max-w-2xl mx-auto py-12">
      <h2 class="text-2xl font-bold mb-6">Cotizador ISR Enajenación</h2>
      
      <form [formGroup]="cotizacionForm" class="space-y-4 p-6 bg-white rounded shadow">
        <!-- Fecha y Valores de Escrituración -->
        <div>
          <label class="block text-sm font-medium mb-2">Fecha de Venta</label>
          <input type="date" formControlName="fecha_venta" class="w-full p-2 border rounded">
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Valor de Escrituración (Venta)</label>
          <input type="number" formControlName="valor_escritura" step="any" formControlName="valor_escritura" class="w-full p-2 border rounded">
        </div>

        <!-- Porcentaje y Exención -->
        <div>
          <label class="block text-sm font-medium mb-2">Porcentaje de Enajenante (%)</label>
          <input type="number" formControlName="porcentaje_enajenante" step="0.01" class="w-full p-2 border rounded">
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Exención de Enajenante</label>
          <select formControlName="exenta" class="w-full p-2 border rounded">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        <!-- Valor original Terreno y Construcción -->
        <div>
          <label class="block text-sm font-medium mb-2">Valor Original Terreno</label>
          <input type="number" formControlName="valor_terreno" step="any" class="w-full p-2 border rounded">
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Valor Original Construcción</label>
          <input type="number" formControlName="valor_constr" step="any" class="w-full p-2 border rounded">
        </div>

        <!-- Fecha de adquisición -->
        <div>
          <label class="block text-sm font-medium mb-2">Fecha de Adquisición</label>
          <input type="date" formControlName="fecha_adquisicion" class="w-full p-2 border rounded">
        </div>

        <button type="submit" formControlName="calcular" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Calcular ISR
        </button>
      </form>
    </div>
  `
})
export class QuoterComponent implements OnInit {
  cotizacionForm!: FormGroup;
  loading = false;
  resultado$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private calculator: CalculatorService,
    private banxico: BanxicoService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cotizacionForm = this.fb.group({
      fecha_venta: ['', Validators.required],
      valor_escritura: [0, Validators.required],
      porcentaje_enajenante: [0, [Validators.required, Validators.min(0)]],
      exenta: [false],
      valor_terreno: [0, Validators.required],
      valor_constr: [0, Validators.required],
      fecha_adquisicion: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.cotizacionForm.invalid) return;

    const datos = this.cotizacionForm.value;
    const creditos = this.auth.getCreditos(); // TODO: obtener créditos del usuario

    this.loading = true;
    this.resultado$ = this.calculator.procesarCotizacion(datos, creditos!.toString()).pipe(
      tap(result => {
        this.guardarCotizacion(resultado);
        this.loading = false;
      })
    );
  }

  private guardarCotizacion(resultado: any) {
    // TODO: Guardar en tabla cotizaciones Supabase
    console.log('Cotización guardada:', resultado);
  }
}