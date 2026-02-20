import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button'; // 1. Importamos el módulo del botón

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonModule], // 2. Le decimos a Angular que este componente usa PrimeNG
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }