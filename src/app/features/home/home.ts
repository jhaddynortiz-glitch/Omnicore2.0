import { Component } from '@angular/core';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
