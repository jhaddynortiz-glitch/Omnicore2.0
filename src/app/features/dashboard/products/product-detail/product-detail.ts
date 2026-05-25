import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductsService, Product } from '../../../../core/services/products.service';
import { CategoriesService, Category } from '../../../../core/services/categories.service';
import { SubcategoriesService, Subcategory } from '../../../../core/services/subcategories.service';
import { ChatService } from '../../../../core/services/chat.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonModule, 
    TableModule, 
    InputTextModule, 
    InputNumberModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TabsModule,
    SelectModule,
    ToggleSwitchModule,
    TooltipModule,
    DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private subcategoriesService = inject(SubcategoriesService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- Estados de Datos ---
  categories = signal<Category[]>([]);
  subcategories = signal<Subcategory[]>([]);
  productId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  isUploadingImage = signal(false);
  isUploadingCardImage = signal(false);

  // --- Estado de UI ---
  activeTab = signal(0);
  newKeyword = signal<string>('');
  newTriggerResponse = signal<string>('');
  triggersList = signal<any[]>([]);

  // --- Formulario Principal ---
  productForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['Bs', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    isActive: [true],
    categoryId: [''], // Selector en UI
    subcategoryId: [''],
    ads: this.fb.array([]),
    isDeliveryEnabled: [true],
    isLocalEnabled: [true],
    isMeetingEnabled: [true],
    cardDescription: [''],
    cardImageUrl: ['']
  });

  // --- Helpers de FormArray para Anuncios ---
  get productAds() {
    return this.productForm.get('ads') as FormArray;
  }

  addAd() {
    this.productAds.push(this.fb.group({
      adId: ['', Validators.required],
      platform: ['meta', Validators.required]
    }));
  }

  removeAd(index: number) {
    this.productAds.removeAt(index);
  }

  // --- Computed para Filtrar Subcategorías ---
  private formCategoryId = toSignal(this.productForm.get('categoryId')!.valueChanges, { initialValue: '' });

  filteredSubcategories = computed(() => {
    const catId = this.formCategoryId();
    if (!catId) return [];
    return this.subcategories().filter(s => s.categoryId === catId);
  });

  // --- Previsualización de Card Dinámica (WhatsApp) ---
  whatsappPreviewHtml = computed(() => {
    // Escuchar cambios de valores
    const name = this.productForm.get('name')?.value || 'Nombre del Producto';
    const description = this.productForm.get('description')?.value || 'Aquí va la descripción del producto que detalla todas sus excelentes características.';
    const price = this.productForm.get('price')?.value || 0;
    const currency = this.productForm.get('currency')?.value || 'Bs';
    const stock = this.productForm.get('stock')?.value || 0;
    const template = this.productForm.get('cardDescription')?.value || '';

    // Interpolación
    let formattedText = template
      .replace(/{{nombre}}/gi, name)
      .replace(/{{Nombre}}/gi, name)
      .replace(/{{descripcion}}/gi, description)
      .replace(/{{precio}}/gi, String(price))
      .replace(/{{moneda}}/gi, currency)
      .replace(/{{stock}}/gi, String(stock));

    // Convertir formato de WhatsApp a HTML
    // Negritas (*texto*)
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    // Cursivas (_texto_)
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    // Tachado (~texto~)
    formattedText = formattedText.replace(/~(.*?)~/g, '<del>$1</del>');
    // Saltos de línea
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  });

  // --- Imagen para la Vista Previa ---
  previewImageUrl = computed(() => {
    const cardImg = this.productForm.get('cardImageUrl')?.value;
    const mainImg = this.productForm.get('imageUrl')?.value;
    return cardImg || mainImg || '';
  });

  // --- Ciclo de Vida ---
  ngOnInit() {
    this.loadCategories();
    this.loadSubcategories();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.productId.set(id);
        this.loadProductDetails(id);
      } else {
        this.productId.set(null);
        this.loading.set(false);
      }
    });

    // Resetear subcategoría al cambiar categoría
    this.productForm.get('categoryId')?.valueChanges.subscribe(() => {
      // Solo resetear si cambia manualmente y no coincide con el valor cargado originalmente
      const subCat = this.productForm.get('subcategoryId')?.value;
      const matched = this.subcategories().find(s => s.id === subCat);
      if (matched && matched.categoryId !== this.productForm.get('categoryId')?.value) {
        this.productForm.get('subcategoryId')?.setValue('');
      }
    });
  }

  loadCategories() {
    this.categoriesService.findAll().subscribe(data => this.categories.set(data));
  }

  loadSubcategories() {
    this.subcategoriesService.findAll().subscribe(data => this.subcategories.set(data));
  }

  loadProductDetails(id: string) {
    this.loading.set(true);
    this.productsService.findOne(id).subscribe({
      next: (product) => {
        this.productAds.clear();
        if (product.ads && product.ads.length > 0) {
          product.ads.forEach(ad => {
            this.productAds.push(this.fb.group({
              adId: [ad.adId, Validators.required],
              platform: [ad.platform, Validators.required]
            }));
          });
        }

        this.triggersList.set(product.triggers || []);

        this.productForm.patchValue({
          ...product,
          categoryId: product.Subcategory?.categoryId || '',
          cardDescription: product.cardDescription || '',
          cardImageUrl: product.cardImageUrl || ''
        } as any);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product details', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el producto' });
        this.router.navigate(['/dashboard/products']);
      }
    });
  }

  // --- Carga de Imágenes ---
  onImageSelected(event: any, type: 'main' | 'card') {
    const file: File = event.target.files[0];
    if (file) {
      if (type === 'main') this.isUploadingImage.set(true);
      else this.isUploadingCardImage.set(true);

      this.chatService.uploadFile(file).subscribe({
        next: (res) => {
          if (type === 'main') {
            this.productForm.patchValue({ imageUrl: res.url });
            this.isUploadingImage.set(false);
          } else {
            this.productForm.patchValue({ cardImageUrl: res.url });
            this.isUploadingCardImage.set(false);
          }
          this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'La imagen se cargó correctamente' });
        },
        error: (err) => {
          console.error('Error uploading image', err);
          this.isUploadingImage.set(false);
          this.isUploadingCardImage.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen' });
        }
      });
    }
  }

  removeImage(type: 'main' | 'card') {
    if (type === 'main') {
      this.productForm.patchValue({ imageUrl: '' });
    } else {
      this.productForm.patchValue({ cardImageUrl: '' });
    }
  }

  // --- Gestión de Disparadores y Respuestas ---
  addTrigger() {
    const keyword = this.newKeyword().trim();
    const response = this.newTriggerResponse().trim();

    if (!keyword || !response) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Campos incompletos', 
        detail: 'Debes ingresar tanto la palabra/frase clave como su respuesta de disparador.' 
      });
      return;
    }

    const current = this.triggersList();

    if (current.some(t => t.keyword.toLowerCase() === keyword.toLowerCase())) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Palabra duplicada', 
        detail: 'Esta palabra o frase clave ya tiene una respuesta asignada.' 
      });
      return;
    }

    this.triggersList.set([...current, { keyword, response }]);
    this.newKeyword.set('');
    this.newTriggerResponse.set('');
    this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Disparador registrado' });
  }

  removeTrigger(keyword: string) {
    this.triggersList.set(this.triggersList().filter(t => t.keyword.toLowerCase() !== keyword.toLowerCase()));
  }

  clearAllTriggers() {
    this.triggersList.set([]);
  }

  // --- Inserción Rápida de Variables en el Textarea ---
  insertVariable(variable: string) {
    const textarea = document.getElementById('cardDescriptionTextarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.productForm.get('cardDescription')?.value || '';
    
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newValue = before + variable + after;

    this.productForm.get('cardDescription')?.setValue(newValue);
    
    // Devolver el foco e indexar cursor
    setTimeout(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }

  // --- Acciones del Formulario ---
  saveProduct() {
    if (this.productForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Formulario Inválido', detail: 'Por favor, rellene todos los campos requeridos.' });
      return;
    }

    this.saving.set(true);
    const { categoryId, ...formData } = this.productForm.value as any;

    // Saneamiento de datos para evitar errores en base de datos
    if (!formData.subcategoryId || formData.subcategoryId === '') {
      formData.subcategoryId = null;
    }

    // Acoplar las respuestas de disparadores
    formData.triggers = this.triggersList().map(t => ({
      keyword: t.keyword,
      response: t.response
    }));

    const id = this.productId();
    const request = id 
      ? this.productsService.update(id, formData)
      : this.productsService.create(formData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'El producto se ha guardado correctamente' });
        setTimeout(() => {
          this.router.navigate(['/dashboard/products']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error saving product', err);
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto' });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/products']);
  }
}
