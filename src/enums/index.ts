export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ShopCategory {
  GROCERY = 'Grocery',
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  RESTAURANT = 'Restaurant',
  BEAUTY = 'Beauty',
  PHARMACY = 'Pharmacy',
  SPORTS = 'Sports',
  HOME_DECOR = 'Home Decor',
  TOYS = 'Toys',
  BOOKSTORE = 'Bookstore',
}

export enum WebhookEvent {
  SHOP_CREATED = 'shop.created',
  SHOP_UPDATED = 'shop.updated',
  SHOP_DELETED = 'shop.deleted',

  CATEGORY_CREATED = 'category.created',
  CATEGORY_UPDATED = 'category.updated',
  CATEGORY_DELETED = 'category.deleted',
}