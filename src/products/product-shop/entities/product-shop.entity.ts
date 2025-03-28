import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductShop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, (shop) => shop.productShops, { nullable: true })
  shop: Shop;

  @ManyToOne(() => Product, (product) => product.productShops)
  product: Product;

  @Column('int')
  stock: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  sku: string;

  @Column('int', { nullable: true, default: 0 })
  minStock?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'varchar', nullable: true })
  availabilityReason?: 'manual' | 'stock_zero' | 'system' | 'deleted';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  modificationHistory: {
    updatedBy: {
      id: string;
      name: string;
    };
    updatedAt: string;
    shopId: string;
    changes: ProductShopChanges;
  }[];
}
