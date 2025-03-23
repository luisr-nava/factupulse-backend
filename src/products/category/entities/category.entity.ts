import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Shop, (user) => user.productCategories, {
    onDelete: 'CASCADE',
  })
  shop: Shop;

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
}
