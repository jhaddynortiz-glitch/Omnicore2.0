import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { OrganizationsService } from '../../../core/services/organizations.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { LogisticsService, DeliveryZone, StoreLocation, MeetingPoint } from '../../../core/services/logistics.service';
import { OperationContactsService, OperationContact } from '../../../core/services/operation-contacts.service';
import { UsersService } from '../../../core/services/users.service';

import * as L from 'leaflet';

// Set up custom default Leaflet icon using official CDN to prevent broken image errors in builds.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    PasswordModule,
    DialogModule,
    SelectModule,
    ToggleSwitchModule,
    TableModule,
    TooltipModule,
    TabsModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './settings.html',
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 2rem auto;
    }
    .field {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.95rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }
    .p-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .helper-text {
      font-size: 0.85rem;
      color: var(--text-color-secondary);
      margin-top: 0.5rem;
      display: block;
    }
    .map-container {
      height: 350px;
      border-radius: 8px;
      border: 1px solid var(--surface-border);
      overflow: hidden;
    }
    .radius-row {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 6px;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--surface-border);
    }
    html.app-dark .radius-row {
      background: rgba(255, 255, 255, 0.03);
    }
  `]
})
export class Settings implements OnInit {
  private orgService = inject(OrganizationsService);
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private logisticsService = inject(LogisticsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private operationContactsService = inject(OperationContactsService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  // Operation Contacts
  operationContacts = signal<OperationContact[]>([]);
  orgMembers = signal<any[]>([]);
  showContactDialog = false;
  isEditingContact = false;
  currentContactForm!: FormGroup;
  contactTypes = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Repartidor / Delivery', value: 'DELIVERY' }
  ];

  // General Settings
  orgData = signal<any>({
    name: '',
    whatsappToken: '',
    whatsappPhoneId: '',
    whatsappVerifyToken: '',
    openaiApiKey: '',
    logoUrl: '',
    isDeliveryEnabled: false,
    isLocalEnabled: false,
    isMeetingEnabled: false
  });

  originalOrgData: any = null;
  isUploadingLogo = false;
  loading = signal(false);
  activeTab = '0';

  onTabChange(event: string | number | undefined) {
    if (event !== undefined && event !== null) {
      this.activeTab = event.toString();
    }
  }

  // 9 Cities of Bolivia
  readonly boliviaCities = [
    { name: 'Santa Cruz', lat: -17.783, lng: -63.182 },
    { name: 'La Paz', lat: -16.500, lng: -68.150 },
    { name: 'Cochabamba', lat: -17.389, lng: -66.157 },
    { name: 'Oruro', lat: -17.983, lng: -67.150 },
    { name: 'Potosí', lat: -19.583, lng: -65.750 },
    { name: 'Chuquisaca', lat: -19.033, lng: -65.262 },
    { name: 'Tarija', lat: -21.535, lng: -64.730 },
    { name: 'Beni', lat: -14.833, lng: -64.900 },
    { name: 'Pando', lat: -11.017, lng: -68.767 }
  ];

  // ==========================================
  // Logistics States
  // ==========================================
  deliveryZones = signal<DeliveryZone[]>([]);
  storeLocations = signal<StoreLocation[]>([]);
  meetingPoints = signal<MeetingPoint[]>([]);

  showZoneDialog = false;
  isEditingZone = false;
  currentZoneForm!: FormGroup;

  showStoreDialog = false;
  isEditingStore = false;
  currentStoreForm!: FormGroup;
  isUploadingStoreImage = false;

  showMeetingDialog = false;
  isEditingMeeting = false;
  currentMeetingForm!: FormGroup;

  // Leaflet Maps
  private deliveryMap: L.Map | null = null;
  private deliveryMarker: L.Marker | null = null;
  private deliveryCircles: L.Circle[] = [];

  private storeMap: L.Map | null = null;
  private storeMarker: L.Marker | null = null;

  ngOnInit() {
    this.initForms();
    this.loadSettings();
    this.loadAllLogistics();
    this.loadOperationContacts();
    this.loadOrgMembers();
  }

  private initForms() {
    // Operation Contact Form
    this.currentContactForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required]],
      type: ['ADMIN', Validators.required],
      userId: [null]
    });

    // Delivery Zone Form
    this.currentZoneForm = this.fb.group({
      id: [''],
      city: ['', Validators.required],
      lat: [0, Validators.required],
      lng: [0, Validators.required],
      radii: this.fb.array([])
    });

    // Reactive dynamic circles redraw when radii fields change
    this.currentZoneForm.get('radii')?.valueChanges.subscribe(() => {
      const lat = this.currentZoneForm.get('lat')?.value;
      const lng = this.currentZoneForm.get('lng')?.value;
      if (lat && lng) {
        this.updateDeliveryCircles(lat, lng);
      }
    });

    // Store Location Form
    this.currentStoreForm = this.fb.group({
      id: [''],
      city: ['', Validators.required],
      address: ['', Validators.required],
      description: [''],
      lat: [0, Validators.required],
      lng: [0, Validators.required],
      imageUrl: ['']
    });

    // Meeting Point Form
    this.currentMeetingForm = this.fb.group({
      id: [''],
      city: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      schedule: ['', Validators.required]
    });
  }

  // ==========================================
  // Form Array Helpers for Delivery Radii
  // ==========================================
  get zoneRadii() {
    return this.currentZoneForm.get('radii') as FormArray;
  }

  addRadius(distanceKm = 0, price = 0) {
    this.zoneRadii.push(this.fb.group({
      distanceKm: [distanceKm, [Validators.required, Validators.min(0.01)]],
      price: [price, [Validators.required, Validators.min(0)]]
    }));
  }

  removeRadius(index: number) {
    this.zoneRadii.removeAt(index);
  }

  // ==========================================
  // Load settings & lists
  // ==========================================
  loadSettings() {
    const user = this.authService.user();
    const orgId = user?.activeOrganizationId;
    if (!orgId) return;

    this.orgService.getById(orgId).subscribe({
      next: (data) => {
        this.orgData.set({
          ...this.orgData(),
          ...data
        });
        this.originalOrgData = JSON.parse(JSON.stringify(this.orgData()));
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración' });
      }
    });
  }

  saveSettings() {
    const user = this.authService.user();
    const orgId = user?.activeOrganizationId;
    if (!orgId) return;

    const current = this.orgData();
    const orig = this.originalOrgData || {};

    const sensitiveChanged = 
      current.name !== orig.name ||
      current.whatsappToken !== orig.whatsappToken ||
      current.whatsappPhoneId !== orig.whatsappPhoneId ||
      current.whatsappVerifyToken !== orig.whatsappVerifyToken ||
      current.openaiApiKey !== orig.openaiApiKey;

    if (sensitiveChanged) {
      this.confirmationService.confirm({
        message: 'Has modificado campos sensibles (Nombre Comercial, credenciales de WhatsApp o OpenAI API Key). ¿Estás seguro de guardar los cambios? Esto podría alterar el funcionamiento del bot y sus automatizaciones.',
        header: 'Confirmación de Cambios Sensibles',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonProps: { severity: 'danger', label: 'Sí, Guardar', class: 'p-button-danger border-round-lg' },
        rejectButtonProps: { label: 'Cancelar', class: 'p-button-text' },
        accept: () => {
          this.executeSaveSettings(orgId);
        }
      });
    } else {
      this.executeSaveSettings(orgId);
    }
  }

  private executeSaveSettings(orgId: string) {
    this.loading.set(true);
    this.orgService.update(orgId, this.orgData()).subscribe({
      next: (updated) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración general guardada' });
        this.orgData.set({ ...this.orgData(), ...updated });
        this.originalOrgData = JSON.parse(JSON.stringify(this.orgData()));
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración' });
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  loadAllLogistics() {
    this.loadDeliveryZones();
    this.loadStoreLocations();
    this.loadMeetingPoints();
  }

  loadDeliveryZones() {
    this.logisticsService.findAllDeliveryZones().subscribe(data => this.deliveryZones.set(data));
  }

  loadStoreLocations() {
    this.logisticsService.findAllStoreLocations().subscribe(data => this.storeLocations.set(data));
  }

  loadMeetingPoints() {
    this.logisticsService.findAllMeetingPoints().subscribe(data => this.meetingPoints.set(data));
  }

  // ==========================================
  // Leaflet Map Delivery Methods
  // ==========================================
  initDeliveryMap(lat: number, lng: number) {
    setTimeout(() => {
      if (this.deliveryMap) {
        this.deliveryMap.remove();
        this.deliveryMap = null;
      }

      const container = document.getElementById('delivery-map');
      if (!container) return;

      this.deliveryMap = L.map('delivery-map').setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.deliveryMap);

      this.deliveryMarker = L.marker([lat, lng]).addTo(this.deliveryMap);
      this.updateDeliveryCircles(lat, lng);

      this.deliveryMap.on('click', (e: L.LeafletMouseEvent) => {
        this.setDeliveryCoords(e.latlng.lat, e.latlng.lng);
      });

      // Fix gray area bug
      setTimeout(() => {
        this.deliveryMap?.invalidateSize();
      }, 100);
    }, 100);
  }

  setDeliveryCoords(lat: number, lng: number) {
    this.currentZoneForm.patchValue({ lat, lng });
    if (this.deliveryMarker) {
      this.deliveryMarker.setLatLng([lat, lng]);
    }
    this.updateDeliveryCircles(lat, lng);
  }

  updateDeliveryCircles(lat: number, lng: number) {
    this.deliveryCircles.forEach(c => c.remove());
    this.deliveryCircles = [];

    if (!this.deliveryMap) return;

    const radii = this.zoneRadii.value || [];
    // Sort descending so outer circles don't block clicks to inner circles
    const sortedRadii = [...radii].sort((a, b) => b.distanceKm - a.distanceKm);
    
    // Nice aesthetic ring colors
    const colors = ['#FF634A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

    sortedRadii.forEach((r, index) => {
      if (!r.distanceKm || r.distanceKm <= 0) return;
      const color = colors[index % colors.length];
      
      const circle = L.circle([lat, lng], {
        radius: r.distanceKm * 1000,
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 1.5
      }).addTo(this.deliveryMap!);

      circle.bindTooltip(`Radio: ${r.distanceKm} km - Tarifa: ${r.price} Bs`, {
        permanent: false,
        direction: 'top'
      });

      this.deliveryCircles.push(circle);
    });
  }

  onDeliveryCityChange(cityName: string) {
    const city = this.boliviaCities.find(c => c.name === cityName);
    if (city) {
      this.currentZoneForm.patchValue({ lat: city.lat, lng: city.lng });
      if (this.deliveryMap) {
        this.deliveryMap.setView([city.lat, city.lng], 12);
        this.setDeliveryCoords(city.lat, city.lng);
      }
    }
  }

  // ==========================================
  // Leaflet Map Store Methods
  // ==========================================
  initStoreMap(lat: number, lng: number) {
    setTimeout(() => {
      if (this.storeMap) {
        this.storeMap.remove();
        this.storeMap = null;
      }

      const container = document.getElementById('store-map');
      if (!container) return;

      this.storeMap = L.map('store-map').setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.storeMap);

      this.storeMarker = L.marker([lat, lng]).addTo(this.storeMap);

      this.storeMap.on('click', (e: L.LeafletMouseEvent) => {
        this.setStoreCoords(e.latlng.lat, e.latlng.lng);
      });

      // Fix gray area bug
      setTimeout(() => {
        this.storeMap?.invalidateSize();
      }, 100);
    }, 100);
  }

  setStoreCoords(lat: number, lng: number) {
    this.currentStoreForm.patchValue({ lat, lng });
    if (this.storeMarker) {
      this.storeMarker.setLatLng([lat, lng]);
    }
  }

  onStoreCityChange(cityName: string) {
    const city = this.boliviaCities.find(c => c.name === cityName);
    if (city) {
      this.currentStoreForm.patchValue({ lat: city.lat, lng: city.lng });
      if (this.storeMap) {
        this.storeMap.setView([city.lat, city.lng], 12);
        this.setStoreCoords(city.lat, city.lng);
      }
    }
  }

  // ==========================================
  // Actions: Delivery Zone
  // ==========================================
  openNewZone() {
    this.isEditingZone = false;
    this.zoneRadii.clear();
    
    // Santa Cruz as default center
    const sc = this.boliviaCities[0];
    this.currentZoneForm.reset({
      id: '',
      city: 'Santa Cruz',
      lat: sc.lat,
      lng: sc.lng
    });
    this.addRadius(3, 10); // add a default radius
    
    this.showZoneDialog = true;
    this.initDeliveryMap(sc.lat, sc.lng);
  }

  editZone(zone: DeliveryZone) {
    this.isEditingZone = true;
    this.zoneRadii.clear();

    this.currentZoneForm.patchValue({
      id: zone.id,
      city: zone.city,
      lat: zone.lat,
      lng: zone.lng
    });

    if (zone.radii && zone.radii.length > 0) {
      zone.radii.forEach(r => this.addRadius(r.distanceKm, r.price));
    }

    this.showZoneDialog = true;
    this.initDeliveryMap(zone.lat, zone.lng);
  }

  saveDeliveryZone() {
    if (this.currentZoneForm.invalid) return;

    const data = this.currentZoneForm.value;
    const request = this.isEditingZone && data.id
      ? this.logisticsService.updateDeliveryZone(data.id, data)
      : this.logisticsService.createDeliveryZone(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Zona de delivery guardada' });
        this.showZoneDialog = false;
        this.loadDeliveryZones();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la zona' });
      }
    });
  }

  deleteDeliveryZone(zone: DeliveryZone) {
    if (!confirm(`¿Eliminar la zona de delivery para ${zone.city}?`)) return;
    this.logisticsService.deleteDeliveryZone(zone.id!).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Zona de delivery eliminada' });
      this.loadDeliveryZones();
    });
  }

  // ==========================================
  // Actions: Store Location
  // ==========================================
  openNewStore() {
    this.isEditingStore = false;
    const sc = this.boliviaCities[0];
    this.currentStoreForm.reset({
      id: '',
      city: 'Santa Cruz',
      address: '',
      description: '',
      lat: sc.lat,
      lng: sc.lng,
      imageUrl: ''
    });

    this.showStoreDialog = true;
    this.initStoreMap(sc.lat, sc.lng);
  }

  editStore(store: StoreLocation) {
    this.isEditingStore = true;
    this.currentStoreForm.patchValue(store);

    this.showStoreDialog = true;
    this.initStoreMap(store.lat, store.lng);
  }

  saveStoreLocation() {
    if (this.currentStoreForm.invalid) return;

    const data = this.currentStoreForm.value;
    const request = this.isEditingStore && data.id
      ? this.logisticsService.updateStoreLocation(data.id, data)
      : this.logisticsService.createStoreLocation(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal guardada' });
        this.showStoreDialog = false;
        this.loadStoreLocations();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la sucursal' });
      }
    });
  }

  deleteStoreLocation(store: StoreLocation) {
    if (!confirm(`¿Eliminar la sucursal en ${store.address}?`)) return;
    this.logisticsService.deleteStoreLocation(store.id!).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal eliminada' });
      this.loadStoreLocations();
    });
  }

  onStoreImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploadingStoreImage = true;
      this.cdr.detectChanges();
      this.chatService.uploadFile(file).subscribe({
        next: (res) => {
          this.currentStoreForm.patchValue({ imageUrl: res.url });
          this.isUploadingStoreImage = false;
          this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'La imagen se cargó correctamente' });
          this.cdr.detectChanges();
        },
        error: () => {
          this.isUploadingStoreImage = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  removeStoreImage() {
    this.currentStoreForm.patchValue({ imageUrl: '' });
  }

  onLogoUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El archivo excede el límite de 2MB' });
      return;
    }

    this.isUploadingLogo = true;
    this.chatService.uploadFile(file).subscribe({
      next: (res) => {
        this.orgData.update(current => ({
          ...current,
          logoUrl: res.url
        }));
        this.isUploadingLogo = false;
        this.messageService.add({ severity: 'success', summary: 'Logo Cargado', detail: 'El logo se subió correctamente. Recuerda guardar los cambios.' });
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUploadingLogo = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen del logo' });
        this.cdr.detectChanges();
      }
    });
  }

  removeLogo() {
    this.orgData.update(current => ({
      ...current,
      logoUrl: null
    }));
    this.messageService.add({ severity: 'info', summary: 'Logo Removido', detail: 'El logo fue quitado. Recuerda guardar los cambios.' });
  }

  // ==========================================
  // Actions: Meeting Point
  // ==========================================
  openNewMeeting() {
    this.isEditingMeeting = false;
    this.currentMeetingForm.reset({
      id: '',
      city: 'Santa Cruz',
      name: '',
      address: '',
      schedule: ''
    });
    this.showMeetingDialog = true;
  }

  editMeeting(point: MeetingPoint) {
    this.isEditingMeeting = true;
    this.currentMeetingForm.patchValue(point);
    this.showMeetingDialog = true;
  }

  saveMeetingPoint() {
    if (this.currentMeetingForm.invalid) return;

    const data = this.currentMeetingForm.value;
    const request = this.isEditingMeeting && data.id
      ? this.logisticsService.updateMeetingPoint(data.id, data)
      : this.logisticsService.createMeetingPoint(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Punto de encuentro guardado' });
        this.showMeetingDialog = false;
        this.loadMeetingPoints();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el punto de encuentro' });
      }
    });
  }

  deleteMeetingPoint(point: MeetingPoint) {
    if (!confirm(`¿Eliminar el punto de encuentro en ${point.name}?`)) return;
    this.logisticsService.deleteMeetingPoint(point.id!).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Punto de encuentro eliminado' });
      this.loadMeetingPoints();
    });
  }

  // ==========================================
  // Actions: Operation Contacts
  // ==========================================
  loadOperationContacts() {
    this.operationContactsService.getContacts().subscribe({
      next: (data) => {
        this.operationContacts.set(data);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los contactos de operación' });
      }
    });
  }

  loadOrgMembers() {
    this.usersService.getOrgMembers().subscribe({
      next: (members) => {
        this.orgMembers.set(members.map((m: any) => m.User).filter((u: any) => u !== null));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios de la organización' });
      }
    });
  }

  openNewContact() {
    this.isEditingContact = false;
    this.currentContactForm.reset({
      id: '',
      name: '',
      phoneNumber: '',
      type: 'ADMIN',
      userId: null
    });
    this.showContactDialog = true;
  }

  editContact(contact: OperationContact) {
    this.isEditingContact = true;
    this.currentContactForm.patchValue({
      id: contact.id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      type: contact.type,
      userId: contact.userId
    });
    this.showContactDialog = true;
  }

  saveContact() {
    if (this.currentContactForm.invalid) return;

    const data = this.currentContactForm.value;
    const request = this.isEditingContact && data.id
      ? this.operationContactsService.updateContact(data.id, data)
      : this.operationContactsService.createContact(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contacto de operación guardado' });
        this.showContactDialog = false;
        this.loadOperationContacts();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el contacto de operación' });
      }
    });
  }

  deleteContact(contact: OperationContact) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el contacto "${contact.name}"?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Eliminar', class: 'p-button-danger border-round-lg' },
      rejectButtonProps: { label: 'Cancelar', class: 'p-button-text' },
      accept: () => {
        this.operationContactsService.deleteContact(contact.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contacto eliminado correctamente' });
            this.loadOperationContacts();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el contacto' });
          }
        });
      }
    });
  }

  goToDedicatedPage() {
    this.router.navigate(['/dashboard/settings/admin-config']);
  }

  goToKeywordsPage() {
    this.router.navigate(['/dashboard/settings/keyword-config']);
  }
}

