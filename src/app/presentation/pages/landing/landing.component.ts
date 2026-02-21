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
  template: `
    <div class="landing-container">
      <p-toast />
      
      <!-- Headless ConfirmDialog Demo -->
      <p-confirmdialog #cd>
        <ng-template #headless let-message let-onAccept="onAccept" let-onReject="onReject">
            @if (message) {
                <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
                    <div class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20">
                        <i class="pi pi-question !text-5xl"></i>
                    </div>
                    <span class="font-bold text-2xl block mb-2 mt-6">{{ message.header }}</span>
                    <p class="mb-0">{{ message.message }}</p>
                    <div class="flex items-center gap-2 mt-6">
                        <p-button label="Aceptar" (onClick)="onAccept()" styleClass="w-32"></p-button>
                        <p-button label="Cancelar" [outlined]="true" (onClick)="onReject()" styleClass="w-32"></p-button>
                    </div>
                </div>
            }
        </ng-template>
      </p-confirmdialog>

      <!-- Navigation -->
      <p-menubar [model]="items" styleClass="border-none shadow-sm rounded-none sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <ng-template pTemplate="start">
          <span class="logo">ERP-Luu</span>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="auth-buttons">
            <p-button label="Iniciar Sesión" icon="pi pi-sign-in" routerLink="/auth/login" styleClass="p-button-text text-gray-700"></p-button>
            <p-button label="Regístrate" icon="pi pi-user-plus" routerLink="/auth/register" severity="contrast"></p-button>
          </div>
        </ng-template>
      </p-menubar>

      <div class="hero">
        <div class="hero-content">
          <h1>Bienvenido a <span class="highlight">ERP-Luu</span></h1>
          <p>La solución ERP premium con arquitectura limpia. Rápida, eficiente y elegante.</p>
          <div class="cta-group">
            <p-button label="Comenzar ahora" icon="pi pi-arrow-right" size="large" routerLink="/auth/register" severity="contrast"></p-button>
            <p-button label="Evaluar Sistema" icon="pi pi-comment" size="large" severity="secondary" [outlined]="true" (onClick)="confirm()"></p-button>
          </div>
        </div>
        <div class="hero-visual">
           <div class="glass-card">
            <i class="pi pi-objects-column" style="font-size: 4rem; color: #333;"></i>
            <h3>Arquitectura Moderna</h3>
            <p>Limpia, mantenible y veloz.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: #f8fafc;
      color: #1e293b;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      margin-right: 2rem;
      color: #111827;
      letter-spacing: -0.5px;
    }
    .auth-buttons {
      display: flex;
      gap: 1rem;
    }
    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6rem 10% 4rem;
      min-height: calc(85vh - 80px);
      gap: 2rem;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
    }
    .hero-content {
      flex: 1;
      max-width: 600px;
    }
    .hero-content h1 {
      font-size: 4rem;
      margin-bottom: 1rem;
      line-height: 1.1;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -1px;
    }
    .hero-content .highlight {
      color: #475569;
    }
    .hero-content p {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
    .cta-group {
      display: flex;
      gap: 1rem;
    }
    .hero-visual {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 20px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    .glass-card:hover {
      transform: translateY(-5px);
    }
    .glass-card h3 {
      font-size: 1.5rem;
      margin: 1.5rem 0 0.5rem;
      color: #1e293b;
    }
    .glass-card p {
      color: #64748b;
      margin: 0;
    }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .p-8 { padding: 2rem; }
    .bg-surface-0 { background-color: #ffffff; }
    .rounded { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    .h-24 { height: 6rem; }
    .w-24 { width: 6rem; }
    .-mt-20 { margin-top: -5rem; }
    .font-bold { font-weight: 700; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .block { display: block; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mb-0 { margin-bottom: 0; }
    .gap-2 { gap: 0.5rem; }
    .w-32 { width: 8rem; }
    .text-5xl { font-size: 3rem; }
  `]
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
