import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Shop } from '../../shop/entities/shop.entity';
import { UserRole } from 'src/enums';
import { ShopCategories } from 'src/shop/category/entities/category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column('text', {
    array: true,
    default: ['OWNER'],
  })
  roles: string[];
  // @Column({
  //   type: 'enum',
  //   enum: UserRole,
  //   default: UserRole.OWNER,
  // })
  // role: UserRole;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Shop, (shop) => shop.owner)
  shops?: Shop[];

  @OneToMany(() => ShopCategories, (category) => category.owner, {
    cascade: true,
  })
  categories: ShopCategories[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeInsert()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
