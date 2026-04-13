import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../../../../application/services/group.service';
import { Group as GroupItem } from '../../../../core/models/group.model';
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

import { PermissionService } from '../../../../application/services/permission.service';
import { PERMISSIONS } from '../../../../core/models/permission.model';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';

const CATEGORIES = ['Ingeniería', 'Diseño', 'Ventas', 'Operaciones', 'Marketing', 'Soporte'];
const LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

@Component({
  // ... (omitting decorators for brevity since replacing all lines up to 60 is error prone, let me use multi_replace instead)

  selector: 'app-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HasPermissionDirective,
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
  templateUrl: './group.html',
  styleUrl: './group.css',
})
export class Group {
  private groupService = inject(GroupService);
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly groups = this.groupService.groups;
  readonly categories = CATEGORIES;
  readonly levels = LEVELS;

  dialogVisible = signal(false);
  editingId = signal<string | null>(null);

  groupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
    level: ['', Validators.required],
    author: ['', Validators.required],
    status: ['active', Validators.required],
  });

  openCreate(): void {
    this.editingId.set(null);
    this.groupForm.reset();
    this.dialogVisible.set(true);
  }

  openEdit(group: GroupItem): void {
    this.editingId.set(group.id);
    this.groupForm.patchValue({
      name: group.name,
      category: group.category,
      level: group.level,
      author: group.author,
      status: group.status,
    });
    this.dialogVisible.set(true);
  }

  viewGroup(group: GroupItem): void {
    this.router.navigate([group.id], { relativeTo: this.route });
  }

  saveGroup(): void {
    if (this.groupForm.invalid) return;
    const { name, category, level, author, status } = this.groupForm.value;
    const id = this.editingId();

    if (id) {
      this.groupService.update(id, { name: name!, category: category!, level: level!, author: author!, status: status as 'active' | 'inactive' });
      this.messageService.add({ severity: 'success', summary: 'Grupo actualizado', detail: `"${name}" se actualizó correctamente` });
    } else {
      this.groupService.create({ name: name!, category: category!, level: level!, author: author!, memberIds: [], tickets: 0 });
      this.messageService.add({ severity: 'success', summary: 'Grupo creado', detail: `"${name}" fue creado exitosamente` });
    }
    this.dialogVisible.set(false);
  }

  confirmDelete(group: GroupItem): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el grupo "<strong>${group.name}</strong>"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.groupService.delete(group.id);
        this.messageService.add({ severity: 'warn', summary: 'Grupo eliminado', detail: `"${group.name}" fue eliminado` });
      },
    });
  }

  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  levelSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'Junior': 'info',
      'Mid': 'secondary',
      'Senior': 'success',
      'Lead': 'contrast',
    };
    return map[level] ?? 'secondary';
  }

  statusSeverity(status: string): 'success' | 'danger' | 'secondary' {
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'danger';
    return 'secondary';
  }
}
