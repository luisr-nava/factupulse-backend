import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/interfaces';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    const userExist = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (userExist) {
      throw new ConflictException(
        `El usuario con el email ${user.email} ya esta registrado`,
      );
    }

    await this.userRepository.save(user);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true },
    });

    if (!user)
      throw new UnauthorizedException(
        `No hay un usuario registrado con el correo ${email}`,
      );

    const isPaswordValid = bcrypt.compareSync(password, user.password);

    if (!isPaswordValid)
      throw new UnauthorizedException('El password es incorrecto');

    if (!user.isActive)
      throw new ForbiddenException(`Aun no has confirmado tu cuenta`);

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const userExist = await this.userRepository.findOneBy({
      email: updateUserDto.email,
    });

    if (userExist) {
      throw new ConflictException(
        `El email ${updateUserDto.email} ya esta registrado`,
      );
    }

    const isMatch = await bcrypt.compare(
      updateUserDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new ForbiddenException('La contraseña actual es incorrecta');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const { currentPassword, ...updateData } = updateUserDto;

    await this.userRepository.update(id, updateData);

    return this.userRepository.findOne({ where: { id } });
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
