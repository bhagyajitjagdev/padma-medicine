import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {}

  validateForm!: FormGroup;
  isLoginIn: boolean = false;
  passwordVisible: boolean = false;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      // remember: [false],
    });
  }

  submitForm(): void {
    this.isLoginIn = true;
    if (this.validateForm.valid) {
      this.loginService.login(this.validateForm.value).subscribe(
        (res) => {
          if (res.code) {
            let data = res.result;
            localStorage.setItem('padma-token', data.token);
            data.userPresent.name = this.loginService.capitalize(
              `${data.userPresent.firstName} ${data.userPresent.lastName}`
            );
            localStorage.setItem(
              'padma-user',
              JSON.stringify(data.userPresent)
            );

            this.router.navigate(['/auth/dashboard']);
            this.loginService.openNotification(res.message);
          } else {
            this.loginService.openNotification(res.message, 'error');
          }
          this.isLoginIn = false;
        },
        ({ error: res }) => {
          this.isLoginIn = false;
          return this.loginService.openNotification(res.message, 'error');
        }
      );
    } else {
      this.isLoginIn = false;
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
