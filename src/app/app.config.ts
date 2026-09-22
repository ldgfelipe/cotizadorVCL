import { provideClientHydration } from '@angular/platform-browser';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  title: 'Cotizador Venta Inmobiliaria',
  pipelines: [],
  providers: [
    provideClientHydration(),
    provideRouter(routes)
  ]
};