import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { APIService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class CheckDashboardGuard implements CanActivate {
  constructor(private control: APIService, private router: Router) {}

  canActivate(): boolean {
    if (this.control.loggedIn === true) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
