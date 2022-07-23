import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { NzTableQueryParams } from "ng-zorro-antd/table/src/table.types";
import { BehaviorSubject, catchError, debounceTime, map, Observable, of, switchMap } from "rxjs";
import { APIService } from "src/app/services/api.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { NzModalService } from "ng-zorro-antd/modal";
import { AddInventoryComponent } from "../../component/add-inventory/add-inventory.component";

@Component({
  selector: "app-inventory",
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.css"],
})
export class InventoryComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private control: APIService,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private modalService: NzModalService
  ) {}

  searchChange$ = new BehaviorSubject("");
  medicine: any[] = [];
  selectedMedicine?: string;
  isLoading = false;

  inventory: any = [];
  loadingInventory = true;
  pageSize = 10;
  pageIndex = 1;
  totalInventory = 1;

  quantitySell = 1;

  filter: any = {};

  expireDate: any;
  dateOfPurchase: any;
  searchInventory: string = "";

  inventoryExpiryNextMonth: any = [];
  last5Sales: any = [];
  last5SalesIncome: number = 0;

  expandSet = new Set<string>();

  validateFormInventorySell!: FormGroup;

  tryingToSellInventory: any;
  saleQuantity: any;
  salePrice: any;

  tabs = ["Expiring Next Month", "Last 5 Sales"];

  isSellInventoryVisible = false;

  ngOnInit(): void {
    this.getMedicine();
    this.getInventory(this.pageIndex, this.pageSize, this.filter, this.searchInventory);

    this.expiryNextMonth();
    this.getLast5Sales();
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

  getInventory(page: number, limit: number, filter?: any, search: string = "", scroll?: boolean) {
    this.control.getInventory({ page, limit, ...filter, search, scroll }).subscribe({
      next: (res) => {
        this.loadingInventory = false;
        if (res.code) {
          this.inventory = res.result.rows;
          this.totalInventory = res.result.totalCount;
        } else {
          return this.control.openNotification(res.message, "error");
        }
      },
      error: ({ error: res }) => {
        return this.control.openNotification(res.message, "error");
      },
    });
  }

  subtractDate(expiryDate: any) {
    return moment(expiryDate).diff(moment(), "days");
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.getInventory(pageIndex, pageSize, this.filter, this.searchInventory);
  }

  applyFilter(reset = false) {
    this.filter = {};

    if (!reset) {
      if (this.selectedMedicine) this.filter.medicineCode = this.selectedMedicine;
      if (this.expireDate && this.expireDate.length) {
        this.filter.expireDateFrom = moment(this.expireDate[0]).format("YYYY-MM-DD");
        this.filter.expireDateTo = moment(this.expireDate[1]).add(1, "d").format("YYYY-MM-DD");
      }
      if (this.dateOfPurchase && this.dateOfPurchase.length) {
        this.filter.dateOfPurchaseFrom = moment(this.dateOfPurchase[0]).format("YYYY-MM-DD");
        this.filter.dateOfPurchaseTo = moment(this.dateOfPurchase[1]).add(1, "d").format("YYYY-MM-DD");
      }
    } else {
      this.selectedMedicine = "";
      this.searchInventory = "";
      this.expireDate = [];
      this.dateOfPurchase = [];
    }

    this.pageSize = 10;
    this.pageIndex = 1;

    this.getInventory(this.pageIndex, this.pageSize, this.filter, this.searchInventory);
  }

  expiryNextMonth() {
    this.control
      .getInventory({
        limit: 999999,
        expireDateFrom: moment().format("YYYY-MM-DD"),
        expireDateTo: moment().endOf("month").add(1, "M").add(1, "d").format("YYYY-MM-DD"),
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.inventoryExpiryNextMonth = res.result.rows;
          } else {
            return this.control.openNotification(res.message, "error");
          }
        },
        error: ({ error: res }) => {
          return this.control.openNotification(res.message, "error");
        },
      });
  }

  getLast5Sales() {
    this.control
      .getSale({
        limit: 5,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.last5Sales = res.result.rows;
            this.last5SalesIncome = res.result.rows.reduce(
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

  onExpandChange(inventoryCode: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(inventoryCode);
    } else {
      this.expandSet.delete(inventoryCode);
    }
  }

  onInventorySearch(event: any) {
    this.searchInventory = event;
    this.getInventory(this.pageIndex, this.pageSize, this.filter, this.searchInventory, true);
  }

  openSellInventoryModal(data: any) {
    this.tryingToSellInventory = JSON.parse(JSON.stringify(data));
    this.isSellInventoryVisible = true;

    this.validateFormInventorySell = this.fb.group({
      saleQuantity: [+data.quantity, [Validators.required]],
      salePrice: [+data.price, [Validators.required]],
    });
  }

  handleCancelSellInventory() {
    this.tryingToSellInventory = {};
    this.isSellInventoryVisible = false;
  }

  handleOkSellInventory() {
    const { saleQuantity, salePrice } = this.validateFormInventorySell.value;

    if (!this.validateFormInventorySell.valid) {
      return this.control.openNotification("Invalid Value", "error");
    }

    if (isNaN(+saleQuantity) || isNaN(+salePrice)) {
      return this.control.openNotification("Invalid Value", "error");
    }

    if (+saleQuantity === 0 || +salePrice === 0) {
      return this.control.openNotification("Invalid Value", "error");
    }

    if (+saleQuantity > +this.tryingToSellInventory.quantity) {
      return this.control.openNotification("Invalid Value", "error");
    }

    this.control
      .createSales({
        saleQuantity,
        salePrice,
        inventoryCode: this.tryingToSellInventory.inventoryCode,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.handleCancelSellInventory();
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

  deleteInventoryById(inventoryCode: string) {
    this.control.updateInventory(inventoryCode, { isDeleted: true }).subscribe({
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

  returnInventoryById(inventoryCode: string) {
    this.control.updateInventory(inventoryCode, { isReturned: true }).subscribe({
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

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  openAddInventoryModal() {
    const modal = this.modalService.create({
      nzKeyboard: false,
      nzMaskClosable: false,
      nzFooter: null,
      nzTitle: "Add Inventory",
      nzContent: AddInventoryComponent,
    });

    modal.afterClose.subscribe(() => {
      this.getInventory(1, 10);
    });
  }
}
