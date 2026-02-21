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
        <p class="text-sm text-gray-500">¿No tienes una cuenta? <a routerLink="/auth/register" class="font-semibold text-gray-900 hover:underline">Regístrate</a></p>
      </div>
    </form>
  `,
  styles: [`
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .auth-header p {
      color: #64748b;
      margin: 0;
    }
    :host ::ng-deep .grayscale-input {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      padding: 1.5rem 0.75rem 0.5rem 0.75rem; 
    }
    :host ::ng-deep .grayscale-password input {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    :host ::ng-deep .grayscale-password {
      width: 100%;
    }
    :host ::ng-deep .p-password {
      width: 100%;
    }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .gap-6 { gap: 1.5rem; }
    .gap-2 { gap: 0.5rem; }
    .items-center { align-items: center; }
    .mt-4 { margin-top: 1rem; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-gray-500 { color: #64748b; }
    .text-gray-600 { color: #475569; }
    .text-gray-900 { color: #0f172a; }
    .font-semibold { font-weight: 600; }
    .hover\\:underline:hover { text-decoration: underline; }
  `]
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
