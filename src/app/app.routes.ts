import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

import { QuoterComponent } from './quoter/quoter.component';
import { CreditsComponent } from './credits/credits.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { CreditsComponent as CC } from './credits/credits.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'credits', component: CreditsComponent, canActivate: [AuthGuard] },
      { path: 'quoter', component: QuoterComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '**', redirectTo: 'login' }
    ]),
    AuthGuard
  ]
};