import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Shop } from '../../shop/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';

export enum EmployeeRole {
  MANAGER = 'ENCARGADO',
  STAFF = 'EMPLEADO',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User) // Relación con la tabla `users`
  @JoinColumn() // Indica que `employees` almacena la FK de `users`
  user: User;

  @ManyToOne(() => Shop, (shop) => shop.employees) // Relación con la tienda donde trabaja
  shop: Shop;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.STAFF, // Por defecto, es un empleado
  })
  role: EmployeeRole;

  @Column({ unique: true })
  dni: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salary: number;

  @Column({ default: true })
  isActive: boolean;
}
