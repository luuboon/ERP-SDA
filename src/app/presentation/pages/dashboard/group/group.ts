import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CardModule, CommonModule],
  templateUrl: './group.html',
  styleUrl: './group.css',
})
export class Group {

}
