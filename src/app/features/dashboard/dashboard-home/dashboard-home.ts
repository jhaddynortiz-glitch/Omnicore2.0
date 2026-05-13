import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome {
  activeChats = signal(24);
  waitingChats = signal(5);
  botResolution = signal(78);
  avgResponseTime = signal('1m 45s');

  recentActivities = signal([
    { icon: 'pi pi-whatsapp', color: 'text-green-500', title: 'Nuevo chat de cliente', desc: 'Orizon está interactuando con +54 9 11 1234-5678', time: 'Hace 2 min' },
    { icon: 'pi pi-check-circle', color: 'text-blue-500', title: 'Consulta resuelta', desc: 'El bot resolvió una consulta de precios', time: 'Hace 5 min' },
    { icon: 'pi pi-user', color: 'text-orange-500', title: 'Reasignación de chat', desc: 'Carlos tomó un chat en espera', time: 'Hace 15 min' },
    { icon: 'pi pi-box', color: 'text-purple-500', title: 'Catálogo sincronizado', desc: 'La IA actualizó sus conocimientos sobre 3 productos nuevos', time: 'Hace 1 hora' }
  ]);

  topProducts = signal([
    { name: 'Suscripción Premium 1 Año', percentage: 85, color: '#10b981' },
    { name: 'Asesoría de Instalación', percentage: 65, color: '#3b82f6' },
    { name: 'Módulo de Facturación', percentage: 40, color: '#f59e0b' },
    { name: 'Plan Básico Mensual', percentage: 25, color: '#8b5cf6' }
  ]);
}
