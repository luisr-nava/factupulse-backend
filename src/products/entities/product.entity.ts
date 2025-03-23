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
import { Shop } from 'src/shop/entities/shop.entity';
import { ProductCategory } from '../category/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  sku: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column('int')
  stock: number;

  @Column('int', { nullable: true })
  minStock?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column()
  isAvailable: boolean;

  @OneToMany(() => ProductShop, (ps) => ps.product)
  productShops: ProductShop[];

  @ManyToMany(() => ProductCategory, (category) => category.products, {
    eager: true,
  })
  @JoinTable()
  categories: ProductCategory[];

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
