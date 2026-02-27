import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

}
