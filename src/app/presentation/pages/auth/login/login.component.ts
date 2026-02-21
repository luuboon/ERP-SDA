import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CheckboxModule, IftaLabelModule],
  template: `
    <div class="auth-header">
      <h2>Bienvenido de Vuelta</h2>
      <p>Inicia sesión para acceder a tu panel de ERP-Luu</p>
    </div>
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form flex flex-col gap-6">
      
      <div class="field">
        <p-iftalabel>
            <input pInputText id="username" formControlName="email" [invalid]="loginForm.controls['email'].invalid && loginForm.controls['email'].touched" autocomplete="off" class="w-full grayscale-input" />
            <label for="username">Usuario / Correo Electrónico</label>
        </p-iftalabel>
      </div>

      <div class="field flex flex-col">
        <p-password 
            id="password" 
            formControlName="password" 
            styleClass="w-full grayscale-password" 
            [feedback]="false"
            autocomplete="off" 
            [toggleMask]="true">
        </p-password>
      </div>
      
      <div class="field-checkbox flex items-center gap-2">
        <p-checkbox formControlName="rememberMe" [binary]="true" inputId="remember"></p-checkbox>
        <label for="remember" class="text-gray-600 text-sm">Recuérdame</label>
      </div>
      
      <p-button label="Iniciar Sesión" type="submit" severity="contrast" [disabled]="loginForm.invalid" styleClass="w-full login-btn"></p-button>
      
      <div class="auth-footer mt-4 text-center">
        <p class="text-sm text-gray-500">¿No tienes una cuenta? <a routerLink="/auth/register" class="font-semibold text-gray-900 hover-underline">Regístrate</a></p>
      </div>
    </form>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login attempt:', this.loginForm.value);
      this.router.navigate(['/']);
    }
  }
}
