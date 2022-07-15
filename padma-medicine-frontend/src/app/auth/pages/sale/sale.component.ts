import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { NzTableQueryParams } from "ng-zorro-antd/table";
import { BehaviorSubject, Observable, catchError, of, map, debounceTime, switchMap } from "rxjs";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-sale",
  templateUrl: "./sale.component.html",
  styleUrls: ["./sale.component.css"],
})
export class SaleComponent implements OnInit {
  constructor(private http: HttpClient, private control: APIService, private fb: FormBuilder) {}

  searchChange$ = new BehaviorSubject("");
  medicine: any[] = [];
  selectedMedicine?: string;
  isLoading = false;

  sale: any = [];
  loadingSale = true;
  pageSize = 10;
  pageIndex = 1;
  totalSale = 1;

  todaySales: any = [];
  todaySalesIncome: number = 0;

  weekSales: any = [];
  weekSalesIncome: number = 0;

  monthSales: any = [];
  monthSalesIncome: number = 0;

  filter: any = {};

  soldDate: any;

  searchSale: string = "";

  expandSet = new Set<string>();

  tabs = ["Today", "Last 7 Days", "Last 30 Days"];

  ngOnInit(): void {
    this.getMedicine();
    this.getSale(this.pageIndex, this.pageSize, this.filter, this.searchSale);

    this.getTodaySale();
    this.getWeekSale();
    this.getMonthSale();
  }

  getMedicine() {
    const getRandomNameList = (name: string): Observable<any> =>
      this.http
        .get(`${this.control.getBaseUrl}medicine`, {
          headers: {
            authorization: `Bearer ${this.control.token}`,
          },
          params: {
            search: name,
            limit: 9999999,
          },
        })
        .pipe(
          catchError(() => of({ results: [] })),
          map((res: any) => res.result.rows)
        );

    const optionList$: Observable<any[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getRandomNameList));
    optionList$.subscribe((data) => {
      this.medicine = data;
      this.isLoading = false;
    });
  }

  getSale(page: number, limit: number, filter?: any, search?: string) {
    this.control.getSale({ page, limit, ...filter, search }).subscribe({
      next: (res) => {
        this.loadingSale = false;
        if (res.code) {
          this.sale = res.result.rows;
          this.totalSale = res.result.totalCount;
        } else {
          return this.control.openNotification(res.message, "error");
        }
      },
      error: ({ error: res }) => {
        return this.control.openNotification(res.message, "error");
      },
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.getSale(pageIndex, pageSize, this.filter, this.searchSale);
  }

  applyFilter(reset = false) {
    this.filter = {};

    if (!reset) {
      if (this.selectedMedicine) this.filter.medicineCode = this.selectedMedicine;
      if (this.soldDate && this.soldDate.length) {
        this.filter.soldFrom = moment(this.soldDate[0]).format("YYYY-MM-DD");
        this.filter.soldTo = moment(this.soldDate[1]).format("YYYY-MM-DD");
      }
    } else {
      this.selectedMedicine = "";
      this.searchSale = "";
      this.soldDate = [];
    }

    this.pageSize = 10;
    this.pageIndex = 1;

    this.getSale(this.pageIndex, this.pageSize, this.filter, this.searchSale);
  }

  getMonthSale() {
    this.control
      .getSale({
        soldFrom: moment().subtract(29, "d").format("YYYY-MM-DD"),
        soldTo: moment().add(1, "d").format("YYYY-MM-DD"),
        limit: 999999,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.monthSales = res.result.rows;
            this.monthSalesIncome = res.result.rows.reduce(
              (sum: number, x: { salePrice: number }) => sum + +x.salePrice,
              0
            );
          } else {
            return this.control.openNotification(res.message, "error");
          }
        },
        error: ({ error: res }) => {
          return this.control.openNotification(res.message, "error");
        },
      });
  }

  getWeekSale() {
    this.control
      .getSale({
        soldFrom: moment().subtract(6, "d").format("YYYY-MM-DD"),
        soldTo: moment().add(1, "d").format("YYYY-MM-DD"),
        limit: 999999,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.weekSales = res.result.rows;
            this.weekSalesIncome = res.result.rows.reduce(
              (sum: number, x: { salePrice: number }) => sum + +x.salePrice,
              0
            );
          } else {
            return this.control.openNotification(res.message, "error");
          }
        },
        error: ({ error: res }) => {
          return this.control.openNotification(res.message, "error");
        },
      });
  }

  getTodaySale() {
    this.control
      .getSale({
        soldFrom: moment().format("YYYY-MM-DD"),
        soldTo: moment().add(1, "d").format("YYYY-MM-DD"),
        limit: 999999,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.todaySales = res.result.rows;
            this.todaySalesIncome = res.result.rows.reduce(
              (sum: number, x: { salePrice: number }) => sum + +x.salePrice,
              0
            );
          } else {
            return this.control.openNotification(res.message, "error");
          }
        },
        error: ({ error: res }) => {
          return this.control.openNotification(res.message, "error");
        },
      });
  }

  onSearch(value: string): void {
    this.isLoading = true;
    this.searchChange$.next(value);
  }

  onExpandChange(saleCode: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(saleCode);
    } else {
      this.expandSet.delete(saleCode);
    }
  }

  onSaleSearch(event: any) {
    this.searchSale = event;
    this.getSale(this.pageIndex, this.pageSize, this.filter, this.searchSale);
  }

  deleteSaleById(saleCode: string) {
    this.control.updateSale(saleCode, { isDeleted: true }).subscribe({
      next: (res) => {
        if (res.code) {
          this.ngOnInit();
          return this.control.openNotification(res.message);
        } else {
          return this.control.openNotification(res.message, "error");
        }
      },
      error: ({ error: res }) => {
        return this.control.openNotification(res.message, "error");
      },
    });
  }
}
