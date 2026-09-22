import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav class="bg-blue-600 p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a href="#" class="text-white font-bold text-xl">Cotizador ISR</a>
        <div class="flex gap-4">
          <a routerLink="/login" class="text-white hover underline">Login</a>
          <a routerLink="/credits" class="text-white hover underline" *ngIf="!auth.isLoggedIn()">Créditos</a>
          <a routerLink="/quoter" class="text-white hover underline" *ngIf="auth.isLoggedIn()">Cotizar</a>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}