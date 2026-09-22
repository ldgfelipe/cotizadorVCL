import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="max-w-md mx-auto py-12">
      <h2 class="text-2xl font-bold mb-6">Iniciar Sesión</h2>
      <form (ngSubmit)="onLogin(form)" #form="ngForm" class="space-y-4">
        <input type="email" name="email" ngModel placeholder="Email" required class="w-full p-2 border rounded">
        <input type="password" name="password" ngModel placeholder="Contraseña" required class="w-full p-2 border rounded">
        <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded">Entrar</button>
      </form>
    </div>
  `
})
export class LoginComponent {
  constructor(public auth: AuthService) {}

  onLogin(form: NgForm) {
    this.auth.login(form.value.email, form.value.password);
  }
}