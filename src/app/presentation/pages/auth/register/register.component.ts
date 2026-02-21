import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectItemGroup } from 'primeng/api';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        RouterLink,
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        StepperModule,
        ToggleButtonModule,
        SelectModule,
        DatePickerModule,
        InputMaskModule,
        CommonModule
    ],
    template: `
    <div class="auth-header mb-6 text-center">
      <h2 class="text-3xl font-bold text-slate-900 mb-2">Crear una Cuenta</h2>
      <p class="text-slate-500">Únete a la plataforma ERP-Luu hoy</p>
    </div>
    
    <div class="flex justify-center flex-col w-full h-full">
        <p-stepper [(value)]="activeStep" class="basis-[100%] w-full">
            <p-step-list class="mb-4">
                <p-step [value]="1" class="flex flex-row flex-auto gap-2">
                    <ng-template #content let-activateCallback="activateCallback" let-value="value">
                        <button class="bg-transparent border-0 inline-flex flex-col gap-2 mx-auto cursor-pointer" (click)="activateCallback()">
                            <span
                                class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center transition-colors"
                                [ngClass]="{
                                    'bg-slate-900 text-white border-slate-900': value <= activeStep,
                                    'border-slate-300 text-slate-400': value > activeStep
                                }"
                            >
                                <i class="pi pi-user text-xl"></i>
                            </span>
                        </button>
                    </ng-template>
                </p-step>
                <p-step [value]="2" class="flex flex-row flex-auto gap-2">
                    <ng-template #content let-activateCallback="activateCallback" let-value="value">
                        <button class="bg-transparent border-0 inline-flex flex-col gap-2 mx-auto cursor-pointer" (click)="activateCallback()">
                            <span
                                class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center transition-colors"
                                [ngClass]="{
                                    'bg-slate-900 text-white border-slate-900': value <= activeStep,
                                    'border-slate-300 text-slate-400': value > activeStep
                                }"
                            >
                                <i class="pi pi-map-marker text-xl"></i>
                            </span>
                        </button>
                    </ng-template>
                </p-step>
                <p-step [value]="3" class="flex flex-row flex-auto gap-2">
                    <ng-template #content let-activateCallback="activateCallback" let-value="value">
                        <button class="bg-transparent border-0 inline-flex flex-col gap-2 mx-auto cursor-pointer" (click)="activateCallback()">
                            <span
                                class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center transition-colors"
                                [ngClass]="{
                                    'bg-slate-900 text-white border-slate-900': value <= activeStep,
                                    'border-slate-300 text-slate-400': value > activeStep
                                }"
                            >
                                <i class="pi pi-check text-xl"></i>
                            </span>
                        </button>
                    </ng-template>
                </p-step>
            </p-step-list>
            
            <p-step-panels>
                <p-step-panel [value]="1">
                    <ng-template #content let-activateCallback="activateCallback">
                        <form [formGroup]="step1Form" class="flex flex-col gap-5 pt-4">
                            <div class="text-center mb-4 text-xl font-semibold text-slate-800">Información Básica</div>
                            
                            <div class="field flex flex-col gap-2">
                                <label for="name" class="font-medium text-slate-700">Nombre Completo</label>
                                <input formControlName="name" pInputText id="name" type="text" placeholder="Ej. Juan Pérez" class="w-full grayscale-input p-3" />
                            </div>
                            
                            <div class="field flex flex-col gap-2">
                                <label for="email" class="font-medium text-slate-700">Correo Electrónico</label>
                                <input formControlName="email" pInputText id="email" type="email" placeholder="juan@ejemplo.com" class="w-full grayscale-input p-3" />
                            </div>
                            
                            <div class="field flex flex-col gap-2">
                                <label for="password" class="font-medium text-slate-700">Contraseña</label>
                                <p-password 
                                    formControlName="password" 
                                    styleClass="w-full grayscale-password" 
                                    placeholder="Contraseña" 
                                    [toggleMask]="true"
                                    [feedback]="false">
                                </p-password>
                            </div>
                            
                            <div class="flex pt-6 justify-end mt-4">
                                <p-button (onClick)="activateCallback(2)" label="Continuar" icon="pi pi-arrow-right" iconPos="right" severity="contrast" [disabled]="step1Form.invalid" />
                            </div>
                            
                            <div class="text-center mt-6 text-sm">
                                <span class="text-slate-500">¿Ya tienes una cuenta? </span>
                                <a routerLink="/auth/login" class="text-slate-900 font-bold hover-underline">Inicia Sesión</a>
                            </div>
                        </form>
                    </ng-template>
                </p-step-panel>
                
                <p-step-panel [value]="2">
                    <ng-template #content let-activateCallback="activateCallback">
                        <form [formGroup]="step2Form" class="flex flex-col gap-5 pt-4">
                            <div class="text-center mb-4 text-xl font-semibold text-slate-800">Ubicación y Detalles</div>
                            
                            <div class="field flex flex-col gap-2">
                                <label class="font-medium text-slate-700">Región / Ciudad</label>
                                <p-select 
                                    [options]="groupedCities" 
                                    formControlName="city" 
                                    placeholder="Selecciona tu ciudad" 
                                    [group]="true" 
                                    styleClass="w-full grayscale-input">
                                    <ng-template let-group #group>
                                        <div class="flex items-center font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-1 mt-2">
                                            <span>{{ group.label }}</span>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>
                            
                            <div class="field flex flex-col gap-2">
                                <label class="font-medium text-slate-700">Fecha de Nacimiento</label>
                                <p-datepicker formControlName="birthDate" styleClass="w-full grayscale-input" placeholder="Elige una fecha" [showIcon]="true"></p-datepicker>
                            </div>
                            
                            <div class="field flex flex-col gap-2">
                                <label class="font-medium text-slate-700">Teléfono</label>
                                <p-inputMask formControlName="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" styleClass="w-full grayscale-input p-3"></p-inputMask>
                            </div>
                            
                            <div class="flex pt-6 justify-between mt-4">
                                <p-button (onClick)="activateCallback(1)" label="Atrás" severity="secondary" icon="pi pi-arrow-left" [outlined]="true" />
                                <p-button (onClick)="completeRegistration()" label="Completar" icon="pi pi-check" iconPos="right" severity="contrast" [disabled]="step2Form.invalid" />
                            </div>
                        </form>
                    </ng-template>
                </p-step-panel>
                
                <p-step-panel [value]="3">
                    <ng-template #content let-activateCallback="activateCallback">
                        <div class="flex flex-col items-center gap-6 mx-auto pt-8 text-center" style="max-width: 24rem">
                            <div class="rounded-full bg-slate-900 text-white w-20 h-20 flex items-center justify-center shadow-lg mb-4">
                                <i class="pi pi-check text-4xl"></i>
                            </div>
                            <div class="text-2xl font-bold text-slate-900">¡Cuenta Creada!</div>
                            <p class="text-slate-500 leading-relaxed">
                                Has registrado exitosamente tu cuenta en ERP-Luu. Hemos enviado un correo de confirmación.
                            </p>
                            
                            <div class="flex pt-8 justify-center w-full">
                                <p-button (onClick)="goToLogin()" label="Ir al Tablero" severity="contrast" styleClass="w-full" />
                            </div>
                        </div>
                    </ng-template>
                </p-step-panel>
            </p-step-panels>
        </p-stepper>
    </div>
  `,
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);

    activeStep: number = 1;

    step1Form = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    step2Form = this.fb.group({
        city: ['', Validators.required],
        birthDate: [null, Validators.required],
        phone: ['', Validators.required]
    });

    groupedCities: SelectItemGroup[] = [
        {
            label: 'América del Norte',
            value: 'na',
            items: [
                { label: 'Ciudad de México', value: 'Ciudad de México' },
                { label: 'Guadalajara', value: 'Guadalajara' },
                { label: 'Monterrey', value: 'Monterrey' },
                { label: 'Nueva York', value: 'Nueva York' },
                { label: 'Los Ángeles', value: 'Los Ángeles' }
            ]
        },
        {
            label: 'América del Sur',
            value: 'sa',
            items: [
                { label: 'Buenos Aires', value: 'Buenos Aires' },
                { label: 'Bogotá', value: 'Bogotá' },
                { label: 'Santiago', value: 'Santiago' }
            ]
        }
    ];

    completeRegistration() {
        if (this.step1Form.valid && this.step2Form.valid) {
            console.log('User registered:', {
                ...this.step1Form.value,
                ...this.step2Form.value
            });
            this.activeStep = 3;
        }
    }

    goToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
