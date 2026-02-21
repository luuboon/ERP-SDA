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
  styles: [`
    .auth-layout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      font-family: var(--font-family, sans-serif);
    }
    .auth-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      color: white;
    }
  `]
})
export class AuthLayoutComponent { }
