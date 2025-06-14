import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';

import { ShopCategory } from 'src/enums';
import { ShopCategories } from '../category/entities/category.entity';
import { ProductShop } from 'src/products/product-shop/entities/product-shop.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductCategory } from 'src/products/category/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  country: string;

  @ManyToOne(() => User, (user) => user.shops, {
    onDelete: 'SET NULL',
  })
  owner: User;

  @ManyToMany(() => User, (user) => user.employeeShops) // Relación con empleados
  employees: User[];

  @ManyToOne(() => ShopCategories, { eager: true })
  category: ShopCategories;

  @OneToMany(() => ProductShop, (ps) => ps.shop)
  productShops: ProductShop[];

  @ManyToMany(() => ProductCategory, (category) => category.shops)
  productCategories: ProductCategory[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
