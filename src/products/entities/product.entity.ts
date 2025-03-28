import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductShop } from '../product-shop/entities/product-shop.entity';
import { ProductCategory } from '../category/entities/category.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @ManyToMany(() => ProductCategory, (category) => category.products, {
    eager: true,
  })
  @JoinTable()
  categories: ProductCategory[];

  @OneToMany(() => ProductShop, (ps) => ps.product)
  productShops: ProductShop[];

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

// Campo	Tipo	Útil para...
// imageUrl	string	Mostrar una imagen
// taxRate	number	Cálculo de IVA personalizado
// unit	string	Unidad de medida: kg, unidad, litros, etc.
// variants	relación	Para talles, colores, sabores, etc.
// barcode	string	Escaneo rápido o integración con POS
// soldQuantity	number	Para estadísticas
