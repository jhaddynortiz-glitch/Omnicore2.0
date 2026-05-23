import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductsService, Product } from '../../../core/services/products.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';
import { SubcategoriesService, Subcategory } from '../../../core/services/subcategories.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    TableModule, 
    DialogModule, 
    InputTextModule, 
    InputNumberModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TabsModule,
    SelectModule,
    ToggleSwitchModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private subcategoriesService = inject(SubcategoriesService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private chatService = inject(ChatService);

  // --- Signals de Datos ---
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  subcategories = signal<Subcategory[]>([]);
  loading = signal(true);
  
  // --- Estados de UI ---
  activeTab = signal(0);
  showProductDialog = signal(false);
  showCategoryDialog = signal(false);
  showSubcategoryDialog = signal(false);
  isEditing = signal(false);
  saving = signal(false);
  isUploadingImage = signal(false);

  // --- Filtros ---
  filterCategory = signal<string | null>(null);
  filterSubcategory = signal<string | null>(null);
  searchQuery = signal<string>('');

  categorySearchQuery = signal<string>('');
  subcategorySearchQuery = signal<string>('');
  subcategoryFilterCategory = signal<string | null>(null);

  // --- Formularios ---
  productForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['Bs', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    isActive: [true],
    categoryId: [''], // Solo para el selector en UI
    subcategoryId: [''],
    ads: this.fb.array([])
  });

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

  categoryForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required]]
  });

  subcategoryForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required]],
    categoryId: ['', [Validators.required]]
  });

  // --- Computed ---
  // Seguimos el valor de la categoría en el formulario como un Signal
  private productModalCategoryId = toSignal(this.productForm.get('categoryId')!.valueChanges, { initialValue: '' });

  // Subcategorías filtradas para el modal de producto
  modalFilteredSubcategories = computed(() => {
    const catId = this.productModalCategoryId();
    if (!catId) return [];
    return this.subcategories().filter(s => s.categoryId === catId);
  });

  // Subcategorías filtradas para la barra de filtros principal (pestaña productos)
  productsFilterSubcategories = computed(() => {
    const catId = this.filterCategory();
    if (!catId) return this.subcategories();
    return this.subcategories().filter(s => s.categoryId === catId);
  });

  filteredCategoriesList = computed(() => {
    const query = this.categorySearchQuery().toLowerCase();
    if (!query) return this.categories();
    return this.categories().filter(c => c.name.toLowerCase().includes(query));
  });

  filteredSubcategoriesList = computed(() => {
    const query = this.subcategorySearchQuery().toLowerCase();
    const catId = this.subcategoryFilterCategory();
    let result = this.subcategories();
    
    if (catId) {
       result = result.filter(s => s.categoryId === catId);
    }
    if (query) {
       result = result.filter(s => s.name.toLowerCase().includes(query));
    }
    return result;
  });

  ngOnInit() {
    this.refreshAll();
    
    // Escuchar cambios en categoría del modal para resetear subcategoría
    this.productForm.get('categoryId')?.valueChanges.subscribe(() => {
        this.productForm.get('subcategoryId')?.setValue('');
    });
  }

  refreshAll() {
    this.loading.set(true);
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
  }

  onFilterCategoryChange() {
    this.filterSubcategory.set(null);
    this.loadProducts();
  }

  loadProducts() {
    const filters = {
        categoryId: this.filterCategory() || undefined,
        subcategoryId: this.filterSubcategory() || undefined,
        search: this.searchQuery() || undefined
    };
    this.productsService.findAll(filters).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCategories() {
    this.categoriesService.findAll().subscribe(data => this.categories.set(data));
  }

  loadSubcategories() {
    this.subcategoriesService.findAll().subscribe(data => this.subcategories.set(data));
  }

  // --- Métodos de Productos ---
  openNewProduct() {
    this.isEditing.set(false);
    this.productForm.reset({ price: 0, stock: 0, currency: 'Bs', isActive: true });
    this.productAds.clear();
    this.showProductDialog.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    
    this.productAds.clear();
    if (product.ads && product.ads.length > 0) {
      product.ads.forEach(ad => {
        this.productAds.push(this.fb.group({
          adId: [ad.adId, Validators.required],
          platform: [ad.platform, Validators.required]
        }));
      });
    }

    this.productForm.patchValue({
        ...product,
        categoryId: product.Subcategory?.categoryId || ''
    });
    this.showProductDialog.set(true);
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    this.saving.set(true);
    const { categoryId, ...data } = this.productForm.value as any;

    // Saneamiento de datos para evitar errores de clave foránea (P2003) en Prisma/Postgres
    if (!data.subcategoryId || data.subcategoryId === '') {
        data.subcategoryId = null;
    }

    const request = this.isEditing() && data.id
      ? this.productsService.update(data.id, data)
      : this.productsService.create(data);

    request.subscribe({
      next: () => {
        this.onSaveSuccess('Producto guardado');
        this.showProductDialog.set(false);
        this.loadProducts();
      },
      error: () => this.onSaveError()
    });
  }

  toggleProductStatus(product: Product) {
    this.productsService.update(product.id!, { isActive: product.isActive }).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: product.name }),
        error: () => {
            product.isActive = !product.isActive; // Revertir en UI
            this.onSaveError();
        }
    });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `¿Eliminar ${product.name}?`,
      header: 'Confirmar',
      accept: () => {
        this.productsService.delete(product.id!).subscribe(() => this.loadProducts());
      }
    });
  }

  onProductImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploadingImage.set(true);
      this.chatService.uploadFile(file).subscribe({
        next: (res) => {
          this.productForm.patchValue({ imageUrl: res.url });
          this.isUploadingImage.set(false);
          this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'La imagen se cargó correctamente' });
        },
        error: (err) => {
          console.error('Error uploading product image', err);
          this.isUploadingImage.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen' });
        }
      });
    }
  }

  removeProductImage() {
    this.productForm.patchValue({ imageUrl: '' });
  }

  // --- Métodos de Categorías ---
  openNewCategory() {
    this.isEditing.set(false);
    this.categoryForm.reset();
    this.showCategoryDialog.set(true);
  }

  editCategory(cat: Category) {
    this.isEditing.set(true);
    this.categoryForm.patchValue(cat);
    this.showCategoryDialog.set(true);
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;
    this.saving.set(true);
    const data = this.categoryForm.value as Category;
    const request = this.isEditing() && data.id ? this.categoriesService.update(data.id, data) : this.categoriesService.create(data);
    
    request.subscribe({
        next: () => {
            this.onSaveSuccess('Categoría guardada');
            this.showCategoryDialog.set(false);
            this.loadCategories();
        },
        error: () => this.onSaveError()
    });
  }

  // --- Métodos de Subcategorías ---
  openNewSubcategory() {
    this.isEditing.set(false);
    this.subcategoryForm.reset();
    this.showSubcategoryDialog.set(true);
  }

  editSubcategory(sub: Subcategory) {
    this.isEditing.set(true);
    this.subcategoryForm.patchValue(sub);
    this.showSubcategoryDialog.set(true);
  }

  saveSubcategory() {
    if (this.subcategoryForm.invalid) return;
    this.saving.set(true);
    const data = this.subcategoryForm.value as Subcategory;
    const request = this.isEditing() && data.id ? this.subcategoriesService.update(data.id, data) : this.subcategoriesService.create(data);
    
    request.subscribe({
        next: () => {
            this.onSaveSuccess('Subcategoría guardada');
            this.showSubcategoryDialog.set(false);
            this.loadSubcategories();
        },
        error: () => this.onSaveError()
    });
  }

  // --- Helpers ---
  private onSaveSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: msg });
    this.saving.set(false);
  }

  private onSaveError() {
    this.saving.set(false);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un problema' });
  }

  getCategoryName(id: string) {
    return this.categories().find(c => c.id === id)?.name || 'Sin Categoría';
  }
}
