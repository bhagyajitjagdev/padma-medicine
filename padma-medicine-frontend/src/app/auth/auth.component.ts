import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { APIService } from "../services/api.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.css"],
})
export class AuthComponent implements OnInit {
  isCollapsed = true;

  spinner: any = false;
  spinSubscription: Subscription | undefined;

  constructor(private control: APIService) {}

  ngOnInit(): void {
    this.spinSubscription = this.control.getSpinner().subscribe((res) => {
      this.spinner = res;
    });
  }

  changeCollapsed(value: boolean) {
    this.isCollapsed = value;
  }
}
