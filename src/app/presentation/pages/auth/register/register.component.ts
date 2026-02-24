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
        CommonModule,
        InputTextModule
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
        usuario: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        ]],
        confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    step2Form = this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        birthDate: [null as Date | null, [Validators.required, this.ageValidator]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
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

    passwordMatchValidator(g: any) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { 'mismatch': true };
    }

    ageValidator(control: any) {
        if (!control.value) return null;
        const birthDate = new Date(control.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18 ? null : { 'underage': true };
    }

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
