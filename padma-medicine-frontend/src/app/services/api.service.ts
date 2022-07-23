import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd/message";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";

interface ResApi {
  code: any;
  result: any;
  message: any;
}

type obj = {
  [key: string]: string | null;
};

@Injectable({
  providedIn: "root",
})
export class APIService {
  private baseUrl = environment.baseURL;
  private docUploadURL = environment.docUploadURL;
  private downloadURL = environment.downloadURL;

  private spinner = new Subject<boolean>();

  private params: any = {};

  private dateFormat: string = "d MMM y";
  private dateTimeFormat: string = "d MMM y h:mm a";

  capitalize = (s: string) =>
    s
      .toLowerCase()
      .split(" ")
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
      .join(" ");

  constructor(
    private http: HttpClient,
    private notification: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    router.events.subscribe((val) => {
      this.params = this.queryParams();
    });
  }

  public get getBaseUrl() {
    return this.baseUrl;
  }

  getSpinner() {
    return this.spinner.asObservable();
  }

  public get getParams() {
    return this.params;
  }

  public get getDateFormat(): string {
    return this.dateFormat;
  }

  public get getDateTimeFormat(): string {
    return this.dateTimeFormat;
  }

  spin(state: boolean) {
    this.spinner.next(state);
  }

  queryParams() {
    const keys = this.route.snapshot.queryParamMap.keys;
    const obj: obj = {};

    keys.forEach((e: string) => {
      obj[e] = this.route.snapshot.queryParamMap.get(e);
    });

    return obj;
  }

  openNotification(message: string, type = "success"): void {
    this.notification.create(type, this.capitalize(message));
  }

  public get loggedIn(): boolean {
    return localStorage.getItem("padma-token") !== null;
  }

  public get token(): string {
    return localStorage.getItem("padma-token") || "";
  }

  public get userData(): object {
    return JSON.parse(localStorage.getItem("padma-user") || "");
  }

  setUserData(user: any) {
    user.name = this.capitalize(`${user.firstName} ${user.lastName}`);
    localStorage.setItem("padma-user", JSON.stringify(user));
    window.location.reload();
  }

  public get UploadURL(): string {
    return this.docUploadURL;
  }
  public get downURL(): string {
    return this.downloadURL;
  }

  fileUpload(payload: any) {
    const formData = new FormData();
    formData.append("file", payload);
    return this.http.post<ResApi>(`${this.baseUrl}file/upload`, payload);
  }

  logout() {
    localStorage.removeItem("padma-token");
    localStorage.removeItem("padma-user");
    this.router.navigate(["/login"]);
  }

  getInventory(params?: any) {
    return this.http.get<ResApi>(`${this.baseUrl}inventory`, {
      params: params,
    });
  }

  getMedicine(params?: any) {
    return this.http.get<ResApi>(`${this.baseUrl}medicine`, {
      params: params,
    });
  }

  createMedicine(body: any) {
    return this.http.post<ResApi>(`${this.baseUrl}medicine`, body);
  }

  createInventory(body: any) {
    return this.http.post<ResApi>(`${this.baseUrl}inventory`, body);
  }

  updateInventory(inventoryCode: string, body: any) {
    return this.http.put<ResApi>(`${this.baseUrl}inventory/${inventoryCode}`, body);
  }

  getSale(params?: any) {
    return this.http.get<ResApi>(`${this.baseUrl}sale`, {
      params: params,
    });
  }

  updateSale(saleCode: string, body: any) {
    return this.http.put<ResApi>(`${this.baseUrl}sale/${saleCode}`, body);
  }

  createSales(body: any) {
    return this.http.post<ResApi>(`${this.baseUrl}sale`, body);
  }
}
