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
import { AuthService } from '../../../../application/services/auth.service';
import { User as UserModel } from '../../../../core/models/user.model';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../../../core/models/permission.model';
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
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  readonly users = this.userService.users;
  readonly allPermissions = ALL_PERMISSIONS;
  readonly canCreateUser = computed(() => this.authService.hasPermission(PERMISSIONS.USER_CREATE));
  readonly canEditUser = computed(() => this.authService.hasPermission(PERMISSIONS.USER_EDIT));
  readonly canDeleteUser = computed(() => this.authService.hasPermission(PERMISSIONS.USER_DELETE));
  readonly canManagePermissions = computed(() => this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS));

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
    this.dialogVisible.set(true);
  }

  openEdit(user: UserModel): void {
    this.editingId.set(user.id);
    const userGroup = this.getUserGroupId(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: user.password,
      groupId: userGroup ?? '',
    });
    this.dialogVisible.set(true);
  }

  openPermissions(user: UserModel): void {
    this.editingPermUser.set(user);
    this.editingPermissions.set([...user.permissions]);
    this.permDialogVisible.set(true);
  }

  savePermissions(): void {
    const user = this.editingPermUser();
    if (!user) return;
    this.userService.update(user.id, { permissions: [...this.editingPermissions()] });
    this.authService.refreshCurrentUser();
    this.messageService.add({ severity: 'success', summary: 'Permisos actualizados', detail: `Permisos de "${user.name}" fueron actualizados` });
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

  saveUser(): void {
    if (this.userForm.invalid) return;
    const { name, email, password, groupId } = this.userForm.value;
    const id = this.editingId();

    if (id) {
      this.userService.update(id, { name: name!, email: email!, password: password! });
      this.updateUserGroup(id, groupId ?? '');
      this.messageService.add({ severity: 'success', summary: 'Usuario actualizado', detail: `"${name}" se actualizó correctamente` });
    } else {
      const newUser = this.userService.create({
        name: name!, email: email!, password: password!,
        permissions: ['ticket:view', 'ticket:create'],
      });
      if (groupId) {
        this.groupService.addMember(groupId, newUser.id);
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

  private updateUserGroup(userId: string, newGroupId: string): void {
    const currentGroupId = this.getUserGroupId(userId);
    if (currentGroupId === newGroupId) return;
    if (currentGroupId) this.groupService.removeMember(currentGroupId, userId);
    if (newGroupId) this.groupService.addMember(newGroupId, userId);
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
