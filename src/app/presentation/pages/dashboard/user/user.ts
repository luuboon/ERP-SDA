import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../application/services/user.service';
import { User as UserModel } from '../../../../core/models/user.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

const ROLES = ['Administrador', 'Analista', 'Soporte', 'Viewer'];

@Component({
  selector: 'app-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    IftaLabelModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  readonly users = this.userService.users;
  readonly roles = ROLES;

  dialogVisible = signal(false);
  editingId = signal<string | null>(null);

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
  });

  openCreate(): void {
    this.editingId.set(null);
    this.userForm.reset();
    this.dialogVisible.set(true);
  }

  openEdit(user: UserModel): void {
    this.editingId.set(user.id);
    this.userForm.patchValue({ name: user.name, email: user.email, role: user.role });
    this.dialogVisible.set(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    const { name, email, role } = this.userForm.value;
    const id = this.editingId();

    if (id) {
      this.userService.update(id, { name: name!, email: email!, role: role! });
      this.messageService.add({ severity: 'success', summary: 'Usuario actualizado', detail: `"${name}" se actualizó correctamente` });
    } else {
      this.userService.create({ name: name!, email: email!, role: role! });
      this.messageService.add({ severity: 'success', summary: 'Usuario creado', detail: `"${name}" fue creado exitosamente` });
    }
    this.dialogVisible.set(false);
  }

  confirmDelete(user: UserModel): void {
    this.confirmationService.confirm({
      message: `¿Eliminar al usuario "<strong>${user.name}</strong>"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.delete(user.id);
        this.messageService.add({ severity: 'warn', summary: 'Usuario eliminado', detail: `"${user.name}" fue eliminado` });
      },
    });
  }

  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  roleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'Administrador': 'contrast',
      'Analista': 'success',
      'Soporte': 'info',
      'Viewer': 'secondary',
    };
    return map[role] ?? 'secondary';
  }
}
