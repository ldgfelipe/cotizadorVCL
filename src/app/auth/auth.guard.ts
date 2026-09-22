import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { supabase } from '../supabase/client';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    return supabase.auth.getUser().pipe(
      map(({ data: { user } }) => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}