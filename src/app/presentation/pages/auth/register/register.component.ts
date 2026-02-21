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
    templateUrl: './register.component.html',
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
