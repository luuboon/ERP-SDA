import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout-container">
      <div class="auth-card">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent { }
