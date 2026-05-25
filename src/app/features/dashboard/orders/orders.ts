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
import { LogisticsService } from '../../../core/services/logistics.service';
import { OperationContactsService, OperationContact } from '../../../core/services/operation-contacts.service';

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
  private logisticsService = inject(LogisticsService);
  private operationContactsService = inject(OperationContactsService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  orderIdSearchQuery = signal('');

  selectedStatusFilter = signal<string>('ALL');
  selectedCityFilter = signal<string>('ALL');
  deliveryZones = signal<any[]>([]);
  deliveryContacts = signal<OperationContact[]>([]);
  selectedOrderToAssign = signal<Order | null>(null);
  selectedDeliveryContactId = signal<string>('');
  showAssignDialog = false;

  statusOptions = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'En Cola', value: 'EN_COLA' },
    { label: 'Asignado', value: 'ASIGNADO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  statusFilterOptions = [
    { label: 'Todos los Estados', value: 'ALL' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'En Cola', value: 'EN_COLA' },
    { label: 'Asignado', value: 'ASIGNADO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  ngOnInit() {
    this.loadOrders();
    this.loadDeliveryZones();
    this.loadDeliveryContacts();
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

  loadDeliveryZones() {
    this.logisticsService.findAllDeliveryZones().subscribe({
      next: (zones) => this.deliveryZones.set(zones),
      error: () => {}
    });
  }

  loadDeliveryContacts() {
    this.operationContactsService.getContacts().subscribe({
      next: (contacts) => {
        this.deliveryContacts.set(contacts.filter(c => c.type === 'DELIVERY'));
      },
      error: () => {}
    });
  }

  onStatusChange(order: Order, newStatus: string) {
    if (newStatus === 'ASIGNADO') {
      this.selectedOrderToAssign.set(order);
      this.selectedDeliveryContactId.set(order.deliveryContactId || '');
      this.showAssignDialog = true;
    } else {
      this.updateOrderStatus(order, newStatus);
    }
  }

  confirmAssignment() {
    const order = this.selectedOrderToAssign();
    const contactId = this.selectedDeliveryContactId();
    if (!order || !contactId) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, selecciona un repartidor' });
      return;
    }

    this.ordersService.updateStatus(order.id!, 'ASIGNADO', contactId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Pedido Asignado', detail: `Pedido de ${order.Contact?.name || 'Cliente'} asignado al repartidor` });
        this.showAssignDialog = false;
        this.selectedOrderToAssign.set(null);
        this.loadOrders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo asignar el repartidor' });
      }
    });
  }

  cancelAssignment() {
    this.showAssignDialog = false;
    this.selectedOrderToAssign.set(null);
    this.loadOrders();
  }

  updateOrderStatus(order: Order, newStatus: string) {
    this.ordersService.updateStatus(order.id!, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: `Pedido de ${order.Contact?.name || 'Cliente'} cambiado a ${newStatus}` });
        this.loadOrders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado del pedido' });
        this.loadOrders(); // revert dropdown
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
  cities = computed(() => {
    const zoneCities = this.deliveryZones().map(z => z.city);
    const orderCities = this.orders().map(o => o.StoreLocation?.city || o.MeetingPoint?.city).filter(Boolean);
    const unique = Array.from(new Set([...zoneCities, ...orderCities]));
    return [{ name: 'Todas las Ciudades', value: 'ALL' }, ...unique.map(c => ({ name: c, value: c }))];
  });

  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatusFilter();
    const city = this.selectedCityFilter();
    let list = this.orders();

    if (status !== 'ALL') {
      list = list.filter(o => o.status === status);
    }

    if (city !== 'ALL') {
      list = list.filter(o => {
        const orderCity = o.StoreLocation?.city || o.MeetingPoint?.city || '';
        return orderCity.toLowerCase() === city.toLowerCase() || 
               (o.shippingAddress || '').toLowerCase().includes(city.toLowerCase());
      });
    }

    if (query) {
      list = list.filter(o => 
        (o.Contact?.name || '').toLowerCase().includes(query) ||
        (o.Contact?.phoneNumber || '').toLowerCase().includes(query) ||
        (o.shippingAddress || '').toLowerCase().includes(query) ||
        (o.items || []).some(item => (item.Product?.name || '').toLowerCase().includes(query))
      );
    }

    const orderIdQuery = this.orderIdSearchQuery().toLowerCase().trim();
    if (orderIdQuery) {
      list = list.filter(o => (o.id || '').toLowerCase().includes(orderIdQuery));
    }

    return list;
  });

  totalRevenue = computed(() => {
    return this.orders()
      .filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);
  });

  pendingCount = computed(() => {
    return this.orders().filter(o => o.status === 'PENDING').length;
  });

  enColaCount = computed(() => {
    return this.orders().filter(o => o.status === 'EN_COLA').length;
  });

  asignadoCount = computed(() => {
    return this.orders().filter(o => o.status === 'ASIGNADO').length;
  });

  entregadoCount = computed(() => {
    return this.orders().filter(o => o.status === 'ENTREGADO').length;
  });

  cancelledCount = computed(() => {
    return this.orders().filter(o => o.status === 'CANCELLED').length;
  });

  conversionRate = computed(() => {
    const total = this.orders().length;
    if (total === 0) return 0;
    const successful = this.orders().filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED').length;
    return (successful / total) * 100;
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
