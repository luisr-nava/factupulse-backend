import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Shop } from '../../shop/entities/shop.entity';
import { ShopCategories } from 'src/shop/category/entities/category.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  codeVerification: string;

  @Column('text', {
    array: true,
    default: ['OWNER'],
  })
  roles: string[];

  @Column({ default: false, nullable: true })
  isActive: boolean;

  // Relación solo para OWNER
  @OneToMany(() => Shop, (shop) => shop.owner)
  shops?: Shop[];

  @OneToMany(() => ShopCategories, (category) => category.owner, {
    cascade: true,
  })
  categories: ShopCategories[];

  // Campos para empleados
  @Column('uuid', { array: true, nullable: true })
  shopId?: string[];

  @Column({ nullable: true })
  dni?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: new Date(), nullable: true })
  hireDate?: string;

  @Column('decimal', { nullable: true })
  salary?: number;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  emergencyContact?: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  resetPasswordCode: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordCodeExpires: Date;

  @Column({ default: false })
  resetPasswordCodeUsed: boolean;

  @ManyToMany(() => Shop, (shop) => shop.employees)
  @JoinTable()
  employeeShops: Shop[];

  @Column({ default: false })
  mustChangePassword: boolean;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeInsert()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
