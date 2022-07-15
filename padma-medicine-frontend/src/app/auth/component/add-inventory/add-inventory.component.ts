import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, ValidationErrors } from "@angular/forms";
import * as moment from "moment";
import { lastValueFrom, Observable, Observer } from "rxjs";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-add-inventory",
  templateUrl: "./add-inventory.component.html",
  styleUrls: ["./add-inventory.component.css"],
})
export class AddInventoryComponent implements OnInit {
  validateForm: FormGroup;

  constructor(private fb: FormBuilder, private control: APIService) {
    this.validateForm = this.fb.group({
      batchCode: ["", [Validators.required], [this.batchCodeAsyncValidator]],
      medicine: ["", [Validators.required]],
      quantity: ["", [Validators.required], [this.quantityPriceNumberValidator]],
      price: ["", [Validators.required], [this.quantityPriceNumberValidator]],
      dateOfPurchase: [moment().format("YYYY-MM-DD"), [Validators.required]],
      expireDate: [moment().add(2, "y").format("YYYY-MM-DD"), [Validators.required]],
    });
  }

  medicine: any = [];

  ngOnInit(): void {}

  submitForm(): void {
    console.log("submit", this.validateForm.value);
  }

  onMedicineSearch(name: string): void {
    this.control
      .getMedicine({
        search: name,
        limit: name === "#" || name === "" ? 10 : 999999,
      })
      .subscribe({
        next: (res) => {
          if (res.code) {
            this.medicine = res.result.rows;
          } else {
            return this.control.openNotification(res.message, "error");
          }
        },
        error: ({ error: res }) => {
          return this.control.openNotification(res.message, "error");
        },
      });
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  batchCodeAsyncValidator = (fc: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.control.getInventory({ batchCode: fc.value }).subscribe({
        next: (res) => {
          if (res.code && res.result.rows.length) {
            observer.next({ error: true, duplicated: true });
          } else {
            observer.next(null);
          }
          observer.complete();
        },
        error: ({ error: res }) => {
          observer.next(null);
          observer.complete();
        },
      });
    });

  quantityPriceNumberValidator = (fc: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      if (fc.value == 0 || isNaN(fc.value)) {
        observer.next({ error: true, number: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });

  async createInventory() {
    try {
      console.log("submit", this.validateForm.value);

      const getMedicine = await lastValueFrom(this.control.getMedicine({ name: this.validateForm.value.medicine }));

      if (!getMedicine.code) {
        return this.control.openNotification(getMedicine.message, "error");
      }

      const medicineFound = getMedicine.result.rows;

      const createObj: any = {};

      createObj.batchCode = this.validateForm.value.batchCode;
      createObj.dateOfPurchase = moment(this.validateForm.value.dateOfPurchase).format("YYYY-MM-DD");
      createObj.expireDate = moment(this.validateForm.value.expireDate).format("YYYY-MM-DD");
      createObj.price = this.validateForm.value.price;
      createObj.quantity = this.validateForm.value.quantity;

      if (medicineFound.length) {
        createObj.medicine = medicineFound[0];
      } else {
        const createMedicine = await lastValueFrom(
          this.control.createMedicine({ name: this.validateForm.value.medicine })
        );

        if (!createMedicine.code) {
          return this.control.openNotification(createMedicine.message, "error");
        }

        createObj.medicine = createMedicine.result.createdMedicine;
      }

      const createdInventory = await lastValueFrom(this.control.createInventory({ ...createObj }));

      this.validateForm.get("batchCode")?.reset();

      return this.control.openNotification(createdInventory.message);
    } catch (error: any) {
      return this.control.openNotification(error.message, "error");
    }
  }
}
