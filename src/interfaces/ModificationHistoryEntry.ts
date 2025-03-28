type ProductShopFieldTypes = {
  sku: string;
  price: number;
  stock: number;
  discount: number;
  minStock: number;
  isAvailable: boolean;
  availabilityReason: 'manual' | 'stock_zero' | 'system' | 'deleted';
};

type ProductShopField = keyof ProductShopFieldTypes;

type FieldChange<K extends ProductShopField> = {
  before: ProductShopFieldTypes[K] | null;
  after: ProductShopFieldTypes[K];
};

type ProductShopChanges = Partial<{
  [K in ProductShopField]: FieldChange<K>;
}>;
