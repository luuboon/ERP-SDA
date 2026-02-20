import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './app.html',  // <--- Actualizado
  styleUrl: './app.css'       // <--- Actualizado
})
export class AppComponent { }