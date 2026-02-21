import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { FieldsetModule } from 'primeng/fieldset';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    MenubarModule,
    FieldsetModule,
    TabsModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  items = [
    { label: 'Soluciones', icon: 'pi pi-bolt' },
    { label: 'Productos', icon: 'pi pi-box' },
    { label: 'Empresa', icon: 'pi pi-building' },
    { label: 'Precios', icon: 'pi pi-tags' }
  ];

  confirm() {
    this.confirmationService.confirm({
      header: 'Evaluando Sistema',
      message: '¿Estás seguro de continuar con la mejor infraestructura?',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Arquitectura validada.', life: 3000 });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Seleccionaste legado.', life: 3000 });
      }
    });
  }
}
