import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, ILike, In, Raw, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Shop } from 'src/shop/entities/shop.entity';
import { UserRole } from 'src/enums';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { codeVerification } from '../utils/code-verification';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly mailerService: MailerService,
  ) {}

  async createOwner(createOwnerDto: CreateOwnerDto) {
    const { password, ...userData } = createOwnerDto;
    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    const userExist = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (userExist) {
      let errors: string[] = [];
      errors.push(`El usuario con el email ${user.email} ya esta registrado`);
      throw new ConflictException(errors);
    }

    const code = codeVerification();

    user.codeVerification = code;

    await this.userRepository.save(user);

    await this.mailerService.sendWelcomeEmail(
      createOwnerDto.email,
      createOwnerDto.name,
      code,
    );

    return {
      ...user,
    };
  }

  async updateOwner(id: string, updateOwnerDto: UpdateOwnerDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (updateOwnerDto.email && updateOwnerDto.email !== user.email) {
      const userExist = await this.userRepository.findOneBy({
        email: updateOwnerDto.email,
      });

      if (userExist) {
        throw new ConflictException(
          `El email ${updateOwnerDto.email} ya está registrado`,
        );
      }
    }

    const isMatch = await bcrypt.compare(
      updateOwnerDto.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new ForbiddenException('La contraseña actual es incorrecta');
    }

    const { currentPassword, password, ...fieldsToUpdate } = updateOwnerDto;

    let hasChanges = false;

    // Compar data with the user objectto check if any field has changed
    // If a field has changed, we update the user in the database
    for (const key of Object.keys(fieldsToUpdate)) {
      const newValue = fieldsToUpdate[key];
      const oldValue = user[key];

      if (newValue !== undefined && newValue !== oldValue) {
        user[key] = newValue;
        hasChanges = true;
      }
    }

    if (password && !(await bcrypt.compare(password, user.password))) {
      user.password = await bcrypt.hash(password, 10);
      hasChanges = true;
    }

    if (hasChanges) {
      await this.userRepository.save(user);
    }

    return {
      message: hasChanges
        ? 'Usuario actualizado correctamente'
        : 'No hubo cambios en la información del usuario',
      user: await this.userRepository.findOne({ where: { id } }),
    };
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, user: User) {
    const {
      fullName,
      email,
      password,
      role,
      shopIds,
      dni,
      phone,
      address,
      hireDate,
      salary,
      isActive = true,
      notes,
      profileImageUrl,
      emergencyContact,
    } = createEmployeeDto;

    let shops: Shop[] = [];

    if (user.roles.includes(UserRole.OWNER)) {
      shops = await this.shopRepository.findBy({
        id: In(shopIds),
        owner: { id: user.id },
      });
    } else if (user.roles.includes(UserRole.MANAGER)) {
      shops = await this.shopRepository
        .createQueryBuilder('shop')
        .innerJoin('shop.employees', 'employee')
        .where('shop.id IN (:...ids)', { ids: shopIds })
        .andWhere('employee.id = :userId', { userId: user.id })
        .getMany();
    }

    if (shops.length !== shopIds.length) {
      throw new NotFoundException(
        'Una o más tiendas no te pertenecen o no estás autorizado',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario con el correo ${email}`,
      );
    }

    const rawPassword = password ?? dni;

    if (!rawPassword) {
      throw new BadRequestException(
        'Se requiere una contraseña o un DNI para el empleado.',
      );
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const mustChangePassword = !password;

    const code = codeVerification();

    const employee = this.userRepository.create({
      name: fullName,
      email,
      password: hashedPassword,
      roles: [role],
      dni,
      phone,
      address,
      hireDate,
      salary,
      isActive,
      notes,
      profileImageUrl,
      emergencyContact,
      employeeShops: shops,
      codeVerification: code,
      mustChangePassword,
    });

    const saved = await this.userRepository.save(employee);

    // await this.mailerService.sendEmployeeAccountCreatedEmail(
    //   createEmployeeDto.email,
    //   createEmployeeDto.fullName,
    //   createEmployeeDto.email,
    // );
    return {
      message: 'Empleado creado exitosamente',
      employeeId: saved.id,
    };
  }

  async findAllEmploye(
    paginationDto: PaginationDto,
    filterDto: FilterDto,
    user: User,
  ) {
    const { limit = 10, page = 0 } = paginationDto;
    const { search, dateFrom, dateTo, shopId, role } = filterDto;

    let targetShopId: string[] = [];

    if (shopId) {
      let shop: Shop | null = null;

      if (user.roles.includes(UserRole.OWNER)) {
        shop = await this.shopRepository.findOne({
          where: { id: shopId, owner: { id: user.id } },
        });
      } else {
        shop = await this.shopRepository
          .createQueryBuilder('shop')
          .innerJoin('shop.users', 'user')
          .where('shop.id = :shopId', { shopId })
          .andWhere('user.id = :userId', { userId: user.id })
          .getOne();
      }

      if (!shop) {
        throw new NotFoundException(
          `La tienda con ID ${shopId} no existe o no tenés acceso.`,
        );
      }

      targetShopId = [shop.id];
    } else {
      let shops: Shop[] = [];

      if (user.roles.includes(UserRole.OWNER)) {
        shops = await this.shopRepository.find({
          where: { owner: { id: user.id } },
          select: ['id'],
        });
      } else {
        shops = await this.shopRepository
          .createQueryBuilder('shop')
          .innerJoin('shop.employees', 'employee')
          .where('employee.id = :userId', { userId: user.id })
          .select(['shop.id']) // evitamos columnas innecesarias
          .getMany();
      }

      targetShopId = shops.map((shop) => shop.id);
    }

    const where: FindOptionsWhere<User>[] = [
      {
        roles: Raw((alias) =>
          role
            ? `'${role}' = ANY (${alias})`
            : `(${alias} && ARRAY['EMPLOYEE', 'MANAGER'])`,
        ),
        employeeShops: {
          id: In(targetShopId),
        },
      },
    ];

    if (search) {
      where[0].name = ILike(`%${search}%`);
    }

    const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

    if (dateFilter) {
      where[0].hireDate = dateFilter as any;
    }

    const [employees, total] = await this.userRepository.findAndCount({
      where,
      relations: ['employeeShops'],
      take: limit,
      skip: page * limit,
    });

    return {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(page / limit) + 1,
      data: employees.map((employee) => ({
        ...employee,
        employeeShops: employee.employeeShops.map((shop) => ({
          id: shop.id,
          name: shop.name,
        })),
      })),
    };
  }

  async findOneEmployee(id: string, user: User) {
    let shopIds: string[] = [];
    if (user.roles.includes(UserRole.OWNER)) {
      const shops = await this.shopRepository.find({
        where: { owner: { id: user.id } },
        select: ['id'],
      });
      shopIds = shops.map((shop) => shop.id);
    } else if (user.roles.includes(UserRole.MANAGER)) {
      const manager = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['employeeShops'],
      });

      if (!manager || !manager.employeeShops.length) {
        throw new NotFoundException(`No tienes tiendas asignadas.`);
      }
      shopIds = manager.employeeShops.map((shop) => shop.id);
    } else {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }
    const employee = await this.userRepository.findOne({
      where: [
        {
          id,
          roles: Raw((alias) => `${alias} && ARRAY['EMPLOYEE', 'MANAGER']`),
        },
      ],
      relations: ['employeeShops'],
    });

    if (
      !employee ||
      !employee.employeeShops.some((s) => shopIds.includes(s.id))
    ) {
      throw new NotFoundException('Empleado no encontrado o no autorizado');
    }

    return {
      ...employee,
      employeeShops: employee.employeeShops.map((shop) => ({
        id: shop.id,
        name: shop.name,
      })),
    };
  }

  async updateEmployee(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    user: User,
  ) {
    const employee = await this.userRepository.findOne({
      where: { id },
      relations: ['employeeShops'],
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const isSelf = user.id === id;

    const hasAccess =
      isSelf ||
      user.roles.includes(UserRole.OWNER) ||
      (user.roles.includes(UserRole.MANAGER) &&
        employee.employeeShops.some((shop) =>
          user.shops?.map((s) => s.id).includes(shop.id),
        ));

    if (!hasAccess) {
      throw new ForbiddenException(
        'No tienes acceso para editar este usuario.',
      );
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: updateEmployeeDto.email,
      });
      if (existingUser) {
        throw new ConflictException(
          `El email ${updateEmployeeDto.email} ya está en uso`,
        );
      }
    }

    if (updateEmployeeDto.password) {
      if (isSelf) {
        if (!updateEmployeeDto.currentPassword) {
          throw new BadRequestException(
            'Debes proporcionar tu contraseña actual para cambiarla.',
          );
        }

        const isMatch = await bcrypt.compare(
          updateEmployeeDto.currentPassword,
          employee.password,
        );

        if (!isMatch) {
          throw new ForbiddenException('La contraseña actual es incorrecta');
        }
      }

      updateEmployeeDto.password = await bcrypt.hash(
        updateEmployeeDto.password,
        10,
      );
    }

    // Mapear el nombre si viene como fullName
    if (updateEmployeeDto.fullName) {
      employee.name = updateEmployeeDto.fullName;
    }

    // Si role viene como string, asignarlo como array
    if (updateEmployeeDto.role) {
      employee.roles = [updateEmployeeDto.role];
    }

    // Actualizar otros campos directamente
    employee.email = updateEmployeeDto.email ?? employee.email;
    employee.password = updateEmployeeDto.password ?? employee.password;
    employee.dni = updateEmployeeDto.dni ?? employee.dni;
    employee.phone = updateEmployeeDto.phone ?? employee.phone;
    employee.address = updateEmployeeDto.address ?? employee.address;
    employee.hireDate = updateEmployeeDto.hireDate ?? employee.hireDate;
    employee.salary = updateEmployeeDto.salary ?? employee.salary;
    employee.notes = updateEmployeeDto.notes ?? employee.notes;
    employee.profileImageUrl =
      updateEmployeeDto.profileImageUrl ?? employee.profileImageUrl;
    employee.emergencyContact =
      updateEmployeeDto.emergencyContact ?? employee.emergencyContact;
    employee.isActive =
      updateEmployeeDto.isActive !== undefined
        ? updateEmployeeDto.isActive
        : employee.isActive;

    if (Array.isArray(updateEmployeeDto.shopIds)) {
      const shops = await this.shopRepository.findBy({
        id: In(updateEmployeeDto.shopIds),
      });
      employee.employeeShops = shops;
    }

    await this.userRepository.save(employee);

    return this.userRepository.findOne({
      where: { id },
      relations: ['employeeShops'],
    });
  }

  async remove(id: string, user: User) {
    const target = await this.userRepository.findOne({
      where: { id },
      relations: ['employeeShops'],
    });

    const loggedUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['shops', 'employeeShops'],
    });

    if (!target) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const isSelf = user.id === id;

    if (isSelf) {
      throw new ForbiddenException('No puedes eliminar tu propio usuario');
    }

    const targetRole = target.roles[0];

    const userRole = user.roles[0];

    const userShopIds =
      loggedUser.shops?.map((s) => s.id) ??
      loggedUser.employeeShops?.map((s) => s.id) ??
      [];

    const sharedShops = target.employeeShops.filter((shop) =>
      userShopIds.includes(shop.id),
    );
    console.log(sharedShops);
    console.log(userShopIds);

    if (sharedShops.length === 0) {
      throw new ForbiddenException(
        'No puedes eliminar a un empleado que no comparte tienda contigo.',
      );
    }

    const canDelete = (() => {
      if (userRole === UserRole.OWNER) return targetRole !== UserRole.OWNER;
      if (userRole === UserRole.MANAGER)
        return (
          targetRole === UserRole.EMPLOYEE || targetRole === UserRole.MANAGER
        );

      return;
    })();

    if (!canDelete) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este usuario.',
      );
    }

    await this.userRepository.delete(id);

    return {
      message: `Empleado ${target.name}eliminado exitosamente`,
    };
  }
}
