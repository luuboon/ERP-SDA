import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../application/services/user.service';
import { GroupService } from '../../../../application/services/group.service';
import { PermissionService } from '../../../../application/services/permission.service';
import { User as UserModel } from '../../../../core/models/user.model';
import { PERMISSIONS } from '../../../../core/models/permission.model';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { AuthService } from '../../../../application/services/auth.service';
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
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
    HasPermissionDirective,
    CheckboxModule,
    PasswordModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService); // for refreshCurrentUser
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  readonly users = this.userService.users;
  readonly allPermissions = Object.values(PERMISSIONS);

  readonly groupOptions = computed(() =>
    this.groupService.groups().map(g => ({ label: g.name, value: g.id }))
  );

  dialogVisible = signal(false);
  permDialogVisible = signal(false);
  editingId = signal<string | null>(null);
  editingPermissions = signal<string[]>([]);
  editingPermUser = signal<UserModel | null>(null);

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    groupId: [''],
  });

  openCreate(): void {
    this.editingId.set(null);
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.dialogVisible.set(true);
  }

  openEdit(user: UserModel): void {
    this.editingId.set(user.id);
    const userGroup = this.getUserGroupId(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '', // Optional for existing users in a real app, let's reset it here
      groupId: userGroup ?? '',
    });
    // Remove required validator on edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.dialogVisible.set(true);
  }

  openPermissions(user: UserModel): void {
    this.editingPermUser.set(user);
    this.editingPermissions.set([...(user.globalPermissions || [])]);
    this.permDialogVisible.set(true);
  }

  async savePermissions(): Promise<void> {
    const user = this.editingPermUser();
    if (!user) return;
    await this.userService.update(user.id, { globalPermissions: [...this.editingPermissions()] });
    // Refrezcar todo el estado al cambiar mis propios permisos
    const currentWait = this.authService.currentUser();
    if (currentWait?.id === user.id) {
        this.authService.logout(); // Si me quito permisos a mi mismo se debe desloguear (por seguridad). Reforzar despues con backend
    }
    this.messageService.add({ severity: 'success', summary: 'Permisos actualizados', detail: `Permisos globales de "${user.name}" fueron actualizados` });
    this.permDialogVisible.set(false);
  }

  togglePermission(perm: string): void {
    const current = this.editingPermissions();
    if (current.includes(perm)) {
      this.editingPermissions.set(current.filter(p => p !== perm));
    } else {
      this.editingPermissions.set([...current, perm]);
    }
  }

  async saveUser(): Promise<void> {
    if (this.userForm.invalid) return;
    const { name, email, password, groupId } = this.userForm.value;
    const id = this.editingId();

    if (id) {
      await this.userService.update(id, { name: name!, email: email! });
      await this.updateUserGroup(id, groupId ?? '');
      this.messageService.add({ severity: 'success', summary: 'Usuario actualizado', detail: `"${name}" se actualizó correctamente` });
    } else {
      const newUser = await this.userService.create({
        name: name!, email: email!,
        globalPermissions: [],
        permissionsByGroup: {}
      });
      if (groupId) {
        await this.groupService.addMember(groupId, newUser.id);
      }
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
        const currentGroup = this.getUserGroupId(user.id);
        if (currentGroup) this.groupService.removeMember(currentGroup, user.id);
        this.userService.delete(user.id);
        this.messageService.add({ severity: 'warn', summary: 'Usuario eliminado', detail: `"${user.name}" fue eliminado` });
      },
    });
  }

  getUserGroupName(userId: string): string {
    const group = this.groupService.groups().find(g => g.memberIds.includes(userId));
    return group?.name ?? '—';
  }

  getUserGroupId(userId: string): string | null {
    const group = this.groupService.groups().find(g => g.memberIds.includes(userId));
    return group?.id ?? null;
  }

  private async updateUserGroup(userId: string, newGroupId: string): Promise<void> {
    const currentGroupId = this.getUserGroupId(userId);
    if (currentGroupId === newGroupId) return;
    if (currentGroupId) await this.groupService.removeMember(currentGroupId, userId);
    if (newGroupId) await this.groupService.addMember(newGroupId, userId);
  }

  getPermissionLabel(user: UserModel): string {
    return this.userService.getPermissionLabel(user);
  }

  permLevelSeverity(user: UserModel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const label = this.getPermissionLabel(user);
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'Super Admin': 'contrast',
      'Avanzado': 'success',
      'Estándar': 'info',
      'Básico': 'secondary',
    };
    return map[label] ?? 'secondary';
  }

  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  formatPermission(perm: string): string {
    return perm.replace(':', ' › ').replace(/^\w/, c => c.toUpperCase());
  }
}
