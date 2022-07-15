import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  constructor(private control: APIService) {}

  userData: any;

  ngOnInit(): void {
    this.userData = this.control.userData;
  }

  logout() {
    this.control.logout();
  }
}
