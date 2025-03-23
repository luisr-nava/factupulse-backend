import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { ShopCategory } from 'src/enums';
import { ShopCategories } from '../category/entities/category.entity';
import { ProductShop } from 'src/products/product-shop/entities/product-shop.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductCategory } from 'src/products/category/entities/category.entity';

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

  @ManyToOne(() => User, (user) => user.shops) // Relación con el dueño de la tienda
  owner: User;

  @OneToMany(() => Employee, (employee) => employee.shop) // Relación con empleados
  employees: Employee[];

  @Column({ type: 'enum', enum: ShopCategory, nullable: true })
  enumCategory: ShopCategory | null; // Categoría predefinida

  @ManyToOne(() => ShopCategories, { nullable: true })
  customCategory: ShopCategories | null; // Categoría personalizada

  @OneToMany(() => ProductShop, (ps) => ps.shop)
  productShops: ProductShop[];

  @OneToMany(() => ProductCategory, (category) => category.shop, {
    cascade: true,
  })
  productCategories: ProductCategory[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
