import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CheckDashboardGuard } from './guards/check-dashboard.guard';
import { CheckLoginGuard } from './guards/check-login.guard';
import { LoginComponent } from './login/login.component';
import { NgZorroAntdModule } from './ng-antd.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [CheckLoginGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    canActivate: [CheckDashboardGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    CommonModule,
  ],
  exports: [RouterModule],
  declarations: [LoginComponent],
})
export class AppRoutingModule {}
