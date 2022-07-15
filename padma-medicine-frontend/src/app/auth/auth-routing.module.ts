import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from '../ng-antd.module';
import { AuthComponent } from './auth.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { MedicineComponent } from './pages/medicine/medicine.component';
import { SaleComponent } from './pages/sale/sale.component';
import { TabsComponent } from './component/tabs/tabs.component';
import { AddInventoryComponent } from './component/add-inventory/add-inventory.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'inventory',
        component: InventoryComponent,
      },
      {
        path: 'sale',
        component: SaleComponent,
      },
      {
        path: 'medicine',
        component: MedicineComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    CommonModule,
  ],
  exports: [RouterModule],
  declarations: [
    DashboardComponent,
    InventoryComponent,
    SaleComponent,
    MedicineComponent,
    TabsComponent,
    AddInventoryComponent,
  ],
})
export class AuthRoutingModule {}
