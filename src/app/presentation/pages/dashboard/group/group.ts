import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../../../../application/services/group.service';
import { Group as GroupItem } from '../../../../core/models/group.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

const CATEGORIES = ['Ingeniería', 'Diseño', 'Ventas', 'Operaciones', 'Marketing', 'Soporte'];
const LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

@Component({
  selector: 'app-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
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
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

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
    members: [0, [Validators.required, Validators.min(0)]],
    tickets: [0, [Validators.required, Validators.min(0)]],
  });

  openCreate(): void {
    this.editingId.set(null);
    this.groupForm.reset({ members: 0, tickets: 0 });
    this.dialogVisible.set(true);
  }

  openEdit(group: GroupItem): void {
    this.editingId.set(group.id);
    this.groupForm.patchValue({
      name: group.name,
      category: group.category,
      level: group.level,
      author: group.author,
      members: group.members,
      tickets: group.tickets,
    });
    this.dialogVisible.set(true);
  }

  saveGroup(): void {
    if (this.groupForm.invalid) return;
    const { name, category, level, author, members, tickets } = this.groupForm.value;
    const id = this.editingId();

    if (id) {
      this.groupService.update(id, { name: name!, category: category!, level: level!, author: author!, members: members!, tickets: tickets! });
      this.messageService.add({ severity: 'success', summary: 'Grupo actualizado', detail: `"${name}" se actualizó correctamente` });
    } else {
      this.groupService.create({ name: name!, category: category!, level: level!, author: author!, members: members!, tickets: tickets! });
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
}
