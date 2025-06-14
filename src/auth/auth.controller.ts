import { Controller, Post, Body, HttpCode, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth, GetUser } from './decorators';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('get-user')
  @Auth(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getUser(@GetUser() user: User) {
    const userId = user.id;
    return this.authService.getUser(userId);
  }

  @Post('verification-account')
  @HttpCode(200)
  verificationAccount(@Body('code') code: string) {
    return this.authService.verificationAccount(code);
  }

  @Post('recovery-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body('email') email: string) {
    return this.authService.resendConfirmation(email);
  }

  @Post('verify-recovery-code')
  @HttpCode(200)
  verifyRecoveryCode(@Body('code') code: string) {
    return this.authService.verifyRecoveryCode(code);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
