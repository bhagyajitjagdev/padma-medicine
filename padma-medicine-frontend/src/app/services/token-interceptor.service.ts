import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs/internal/observable/throwError";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptorService {
  constructor(private control: APIService) {}

  private stack: number[] = [];

  private handleError(err: HttpErrorResponse) {
    this.control.spin(false);
    if (err.status === 401 || err.status === 403) {
      this.stack = [];
      this.control.logout();
    }
    return throwError(err);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!req.params.get("scroll")) {
      this.control.spin(true);
      this.stack.push(1);
    }

    console.log("push", this.stack);

    //GET TOKEN
    const authToken = localStorage.getItem("padma-token");

    //SET TOKEN
    const authRequest = req.clone({
      headers: req.headers.set("Authorization", "Bearer " + authToken),
    });

    return next
      .handle(authRequest)
      .pipe(
        tap((event: any) => {
          if (event instanceof HttpResponse) {
            if (!req.params.get("scroll")) {
              this.stack.pop();
              console.log("pop", this.stack);

              if (!this.stack.length) {
                this.control.spin(false);
              }
            }
          }
        })
      )
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }
}
