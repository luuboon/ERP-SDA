import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CheckboxModule, IftaLabelModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // Practica 3: Hardcoded credentials
      if (email === 'admin@erp.com' && password === 'Admin123!@#') {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bienvenido a ERP-Luu' });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Credenciales Inválidas' });
      }
    }
  }
}
