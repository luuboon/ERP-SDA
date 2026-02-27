import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SkeletonModule, CardModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

}
