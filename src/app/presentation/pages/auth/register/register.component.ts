import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../application/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
      return;
    }

    const result = this.auth.register({ name: name!, email: email!, password: password! });

    if (result.success) {
      this.messageService.add({ severity: 'success', summary: 'Cuenta creada', detail: 'Bienvenido a ERP-Luu' });
      setTimeout(() => this.router.navigate(['/dashboard']), 500);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: result.error! });
    }
  }
}
