import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from 'src/environments/environment';
interface ResApi {
  code: any;
  result: any;
  message: any;
}
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  baseUrl = environment.baseURL;
  capitalize = (s: string) =>
    s
      .toLowerCase()
      .split(' ')
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
      .join(' ');

  constructor(
    private http: HttpClient,
    private notification: NzMessageService
  ) {}

  // login API url
  private loginUrl = `${this.baseUrl}user/login`;

  // login function
  login(payload: object) {
    return this.http.post<ResApi>(this.loginUrl, payload);
  }

  openNotification(message: string, type = 'success'): void {
    this.notification.create(type, this.capitalize(message));
  }
}
