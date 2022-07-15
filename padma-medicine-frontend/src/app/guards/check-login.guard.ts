import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { APIService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class CheckLoginGuard implements CanActivate {
  constructor(private control: APIService, private router: Router) {}

  canActivate(): boolean {
    if (this.control.loggedIn === false) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
