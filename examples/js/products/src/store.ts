import type { Category, Product } from './schemas';

let nextCategoryId = 7;
let nextProductId = 5;

const categories: Category[] = [
  { id: 1, name: 'Electronics', parentId: null },
  { id: 2, name: 'Clothing', parentId: null },
  { id: 3, name: 'Phones', parentId: 1 },
  { id: 4, name: 'Laptops', parentId: 1 },
  { id: 5, name: 'Tops', parentId: 2 },
  { id: 6, name: 'Footwear', parentId: 2 },
];

const products: Product[] = [
  { id: 1, name: 'Galaxy S25', sku: 'GAL-S25', price: 899, categoryId: 3 },
  { id: 2, name: 'ThinkPad X1', sku: 'TP-X1', price: 1299, categoryId: 4 },
  { id: 3, name: 'Classic T-Shirt', sku: 'TS-001', price: 29, categoryId: 5 },
  { id: 4, name: 'Running Shoes', sku: 'RS-001', price: 89, categoryId: 6 },
];

const seedCategories = categories.map((c) => ({ ...c }));
const seedProducts = products.map((p) => ({ ...p }));

export const categoryStore = {
  all(): Category[] {
    return categories;
  },

  find(id: string): Category | undefined {
    return categories.find((c) => c.id === Number(id));
  },

  create(data: unknown): Category {
    const category = {
      ...(data as Omit<Category, 'id'>),
      id: nextCategoryId++,
    } as Category;
    categories.push(category);
    return category;
  },

  update(id: string, data: unknown): Category | undefined {
    const idx = categories.findIndex((c) => c.id === Number(id));
    if (idx === -1) return undefined;
    const existing = categories[idx];
    if (!existing) return undefined;
    categories[idx] = { ...existing, ...(data as Partial<Category>) };
    return categories[idx];
  },

  delete(id: string): boolean {
    const idx = categories.findIndex((c) => c.id === Number(id));
    if (idx === -1) return false;
    categories.splice(idx, 1);
    return true;
  },

  allAsOptions(): { label: string; value: number }[] {
    return categories.map((c) => ({ label: c.name, value: c.id }));
  },

  reset(): void {
    categories.length = 0;
    categories.push(...seedCategories.map((c) => ({ ...c })));
    nextCategoryId = 7;
  },
};

export const productStore = {
  all(): Product[] {
    return products;
  },

  find(id: string): Product | undefined {
    return products.find((p) => p.id === Number(id));
  },

  create(data: unknown): Product {
    const product = {
      ...(data as Omit<Product, 'id'>),
      id: nextProductId++,
    } as Product;
    products.push(product);
    return product;
  },

  update(id: string, data: unknown): Product | undefined {
    const idx = products.findIndex((p) => p.id === Number(id));
    if (idx === -1) return undefined;
    const existing = products[idx];
    if (!existing) return undefined;
    products[idx] = { ...existing, ...(data as Partial<Product>) };
    return products[idx];
  },

  delete(id: string): boolean {
    const idx = products.findIndex((p) => p.id === Number(id));
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },

  reset(): void {
    products.length = 0;
    products.push(...seedProducts.map((p) => ({ ...p })));
    nextProductId = 5;
  },
};
