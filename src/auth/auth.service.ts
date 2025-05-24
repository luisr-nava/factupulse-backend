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
    });

    let errors: string[] = [];

    if (!user) {
      errors.push(`No hay un usuario registrado con el correo ${email}`);
      throw new UnauthorizedException(errors);
    }

    const isPaswordValid = bcrypt.compareSync(password, user.password);

    if (!isPaswordValid) {
      errors.push('El password es incorrecto');
      throw new UnauthorizedException(errors);
    }

    if (!user.isActive) {
      errors.push('Aun no has confirmado tu cuenta');
      throw new ForbiddenException(errors);
    }

    if (user.mustChangePassword) {
      errors.push(
        'Debés cambiar tu contraseña antes de acceder a la plataforma.',
      );
      throw new ForbiddenException(errors);
    }
    const token = this.getJwtToken({ id: user.id });

    return {
      user,
      token,
    };
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['shops'],
    });

    let errors: string[] = [];
    
    if (!user) {
      errors.push('Usuario no encontrado');
      throw new NotFoundException(errors);
    }
    return user;
  }

  async verificationAccount(code: string) {
    const user = await this.userRepository.findOne({
      where: {
        codeVerification: code,
      },
    });
    let errors: string[] = [];

    if (!user) {
      errors.push('El código es incorrecto');
      throw new NotFoundException(errors);
    }

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

  async resendConfirmation(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      let errors: string[] = [];
      errors.push(`No hay un usuario registrado con el correo ${email}`);
      throw new NotFoundException(errors);
    }
    const code = codeVerification();
    user.codeVerification = code;
    await this.userRepository.save(user);

    await this.mailerService.resendVerificationEmail(email, user.name, code);

    return { message: 'Correo reenviado' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    let errors: string[] = [];

    if (!user) {
      errors.push(`No hay un usuario registrado con el correo ${email}`);
      throw new NotFoundException(errors);
    }

    const code = codeVerification();

    user.resetPasswordCode = code;

    user.resetPasswordCodeExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 min

    user.resetPasswordCodeUsed = false;

    await this.userRepository.save(user);

    await this.mailerService.sendResetPasswordEmail(email, user.name, code);
    return {
      message: `Se ha enviado un código de verificación a ${email}`,
    };
  }

  async resetPassword(code: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordCode: code },
    });

    const errors: string[] = [];

    if (!user) {
      errors.push("El enlace para restablecer la contraseña ha expirado. Solicitá uno nuevo.");
      throw new UnauthorizedException(errors);
    }

    if (user.resetPasswordCodeUsed) {
      errors.push('Este enlace ya fue utilizado.');
      throw new UnauthorizedException(errors);
    }

    if (user.resetPasswordCodeExpires < new Date()) {
      errors.push('El enlace ha expirado. Solicitá uno nuevo.');
      throw new UnauthorizedException(errors);
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordCodeUsed = true;

    user.resetPasswordCode = null;

    user.resetPasswordCodeExpires = null;

    await this.userRepository.save(user);

    return { message: 'Contraseña restablecida con éxito' };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload, {
      expiresIn: '4h',
    });
    return token;
  }
}
