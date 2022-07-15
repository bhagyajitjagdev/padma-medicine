import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { APIService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class CheckAdminGuard implements CanActivate {
  constructor(private control: APIService, private router: Router) {}

  canActivate(): boolean {
    const userData: any = this.control.userData;
    if (userData.userType === 'ADMIN') {
      return true;
    } else {
      this.control.openNotification(
        "You don't have access to this page",
        'warning'
      );
      this.router.navigate(['/auth/dashboard']);
      return false;
    }
  }
}
