import { Component, OnInit, HostListener } from "@angular/core";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-medicine",
  templateUrl: "./medicine.component.html",
  styleUrls: ["./medicine.component.css"],
})
export class MedicineComponent implements OnInit {
  constructor(private control: APIService) {}

  gridStyle = {
    width: "33.3333333%",
    textAlign: "center",
  };

  medicine: any = [];
  loadingMedicine = true;
  pageSize = 100;
  pageIndex = 1;
  totalMedicine = 1;
  searchMedicine: string = "";

  ngOnInit(): void {
    this.getMedicine(this.pageIndex, this.pageSize, this.searchMedicine);
  }

  @HostListener("window:scroll", ["$event"])
  scrollHandler() {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    const currentPos = pos + 20;

    if (max < currentPos) {
      this.pageIndex += 1;

      this.getMedicine(this.pageIndex, this.pageSize, this.searchMedicine);
    }
  }

  getMedicine(page: number, limit: number, search?: string, scroll?: boolean) {
    this.control.getMedicine({ page, limit, search, scroll }).subscribe({
      next: (res) => {
        this.loadingMedicine = false;
        if (res.code) {
          if (this.pageIndex === 1) {
            this.medicine = res.result.rows;
            this.totalMedicine = res.result.totalCount;
          } else {
            this.medicine = [...this.medicine, ...res.result.rows];
          }
        } else {
          return this.control.openNotification(res.message, "error");
        }
      },
      error: ({ error: res }) => {
        return this.control.openNotification(res.message, "error");
      },
    });
  }

  onMedicineSearch(event: any) {
    this.searchMedicine = event;

    this.pageIndex = 1;

    this.getMedicine(this.pageIndex, this.pageSize, this.searchMedicine, true);
  }
}
