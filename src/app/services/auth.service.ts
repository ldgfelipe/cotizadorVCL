import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { supabase } from '../supabase/client';

@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate {
  constructor(public auth: Auth, private router: Router) {}

  async login(email: string, password: string) {
    // TODO: Implementar login con Firebase Auth / Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email
    });
    if (error) throw error;
  }

  async register(email: string, password: string, nombre: string) {
    // TODO: Registro Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    });
    if (error) throw error;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  getCurrentUser() {
    return supabase.auth.getUser();
  }

  canActivate(): boolean {
    // Placeholder - implementar guard real
    return true;
  }
}