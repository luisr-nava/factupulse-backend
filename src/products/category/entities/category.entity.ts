import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class ShopSummaryDto {
  id: string;
  name: string;
}

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Shop, (shop) => shop.productCategories, { eager: true })
  @JoinTable()
  shops: ShopSummaryDto[];

  @ManyToOne(() => User, { nullable: false, eager: true })
  createdBy: User;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];

  @Column('jsonb', { default: [] })
  modificationHistory: {
    updatedBy: { id: string; name: string };
    updatedAt: string;
    changes: Record<string, { before: any; after: any }>;
  }[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
