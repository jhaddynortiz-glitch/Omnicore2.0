import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { OrdersService, Order } from '../../../core/services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    SelectModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './orders.html',
  styles: [`
    .orders-container {
      max-width: 1400px;
      margin: 2rem auto;
    }
    .metric-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      padding: 1.5rem;
      flex-grow: 1;
      min-width: 220px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
    }
    .funnel-bar-container {
      width: 100%;
      height: 8px;
      background: #ECEFF1;
      border-radius: 4px;
      overflow: hidden;
    }
    :host-context(html.app-dark) .funnel-bar-container {
      background: #37474F;
    }
    .funnel-bar-fill {
      height: 100%;
      transition: width 0.4s ease;
    }
    .status-select {
      width: 140px;
    }
    .expanded-details-card {
      background: rgba(0, 0, 0, 0.015);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 1rem;
    }
    :host-context(html.app-dark) .expanded-details-card {
      background: rgba(255, 255, 255, 0.02);
    }
  `]
})
export class Orders implements OnInit {
  private ordersService = inject(OrdersService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  orders = signal<Order[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  statusOptions = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.ordersService.findAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pedidos' });
        this.loading.set(false);
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: string) {
    this.ordersService.updateStatus(order.id!, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: `Pedido de ${order.Contact?.name || 'Cliente'} cambiado a ${newStatus}` });
        this.loadOrders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado del pedido' });
      }
    });
  }

  deleteOrder(order: Order) {
    if (!confirm('¿Estás seguro de eliminar permanentemente este pedido?')) return;
    this.ordersService.delete(order.id!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido eliminado' });
        this.loadOrders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el pedido' });
      }
    });
  }

  // --- Computed Metrics (Funnel Analysis) ---
  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const list = this.orders();
    if (!query) return list;

    return list.filter(o => 
      (o.Contact?.name || '').toLowerCase().includes(query) ||
      (o.Contact?.phoneNumber || '').toLowerCase().includes(query) ||
      (o.id || '').toLowerCase().includes(query)
    );
  });

  totalRevenue = computed(() => {
    return this.orders()
      .filter(o => o.status === 'CONFIRMED')
      .reduce((sum, o) => sum + o.total, 0);
  });

  pendingCount = computed(() => {
    return this.orders().filter(o => o.status === 'PENDING').length;
  });

  confirmedCount = computed(() => {
    return this.orders().filter(o => o.status === 'CONFIRMED').length;
  });

  cancelledCount = computed(() => {
    return this.orders().filter(o => o.status === 'CANCELLED').length;
  });

  conversionRate = computed(() => {
    const total = this.orders().length;
    if (total === 0) return 0;
    return (this.confirmedCount() / total) * 100;
  });

  deliveryPercentage = computed(() => {
    const total = this.orders().filter(o => o.deliveryMethod).length;
    if (total === 0) return 0;
    const deliveries = this.orders().filter(o => o.deliveryMethod === 'DELIVERY').length;
    return (deliveries / total) * 100;
  });

  localPercentage = computed(() => {
    const total = this.orders().filter(o => o.deliveryMethod).length;
    if (total === 0) return 0;
    const locals = this.orders().filter(o => o.deliveryMethod === 'LOCAL').length;
    return (locals / total) * 100;
  });

  meetingPercentage = computed(() => {
    const total = this.orders().filter(o => o.deliveryMethod).length;
    if (total === 0) return 0;
    const meetings = this.orders().filter(o => o.deliveryMethod === 'MEETING').length;
    return (meetings / total) * 100;
  });

  getGoogleMapsUrl(lat?: number, lng?: number): string {
    if (!lat || !lng) return '';
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}
