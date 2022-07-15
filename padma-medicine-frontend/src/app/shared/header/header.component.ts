import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  constructor(private control: APIService) {}
  @Output() fromChildCollapse = new EventEmitter<boolean>();
  item: boolean = false;

  menuClicked() {
    this.item = !this.item;
    this.fromChildCollapse.emit(this.item);
  }

  userData: any;

  ngOnInit(): void {
    this.userData = this.control.userData;
  }
}
