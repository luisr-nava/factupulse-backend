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
import { LoginUserDto } from './dto';
import { User } from 'src/users/entities/user.entity';
import { codeVerification } from 'src/utils/code-verification';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        isActive: true,
        mustChangePassword: true,
        roles: true,
        name: true,
        profileImageUrl: true,
      },
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

    if (user.mustChangePassword)
      throw new ForbiddenException(
        'Debés cambiar tu contraseña antes de acceder a la plataforma.',
      );

    const token = this.getJwtToken({ id: user.id });

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      roles: user.roles,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      token,
    };
  }

  async verificationAccount(code: string) {
    const user = await this.userRepository.findOneBy({
      codeVerification: code,
    });

    if (!user) throw new NotFoundException('El código es incorrecto');

    user.isActive = true;
    user.codeVerification = null;
    await this.userRepository.save(user);

    return { message: 'Cuenta verificada con éxito' };
  }

  async verifyRecoveryCode(code: string) {
    const user = await this.userRepository.findOne({
      where: { codeVerification: code },
    });

    if (!user) {
      throw new NotFoundException(
        'El código de verificación es incorrecto o ha expirado',
      );
    }
    return { message: 'Código verificado correctamente' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user)
      throw new NotFoundException(
        `No hay un usuario registrado con el correo ${email}`,
      );

    const token = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    user.codeVerification = codeVerification();
    await this.userRepository.save(user);

    await this.mailerService.sendResetPasswordEmail(email, user.name, token);
    return {
      message: `Se ha enviado un código de verificación a ${email}`,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('El token es inválido o ha expirado');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException('No se puede restablecer la contraseña.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.codeVerification = null;
    await this.userRepository.save(user);

    return { message: 'Contraseña restablecida con éxito' };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
