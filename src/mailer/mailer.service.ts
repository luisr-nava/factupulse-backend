import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from 'src/config';
@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: envs.smtpUser,
      pass: envs.smtpPass,
    },
  });

  async sendWelcomeEmail(to: string, name: string, code: string) {
    const html = `
      <div style="background-color: #fff3f6; padding: 30px; font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dszkopurc/image/upload/v1743191298/FactuPulse/property/mbmmvmzdkjllk5eqciuh.webp" alt="FactuPulse Logo" style="width: 100px; height: auto;" />
        </div>

        <h2 style="text-align: center; color: #333;">¡Bienvenido a FactuPulse!</h2>

        <p>Hola <strong>${name}</strong>,</p>

        <p>Tu cuenta ha sido creada correctamente. Ya podés comenzar a gestionar tu negocio de manera más eficiente con nuestra plataforma.</p>

        <p>Antes de empezar, usá el siguiente <strong>código de verificación</strong> para activar tu cuenta:</p>

        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; padding: 15px 25px; background-color: #ff99b2; color: white; font-size: 24px; font-weight: bold; border-radius: 8px;">
            ${code}
          </div>
        </div>

        <p>Validá tu cuenta haciendo clic en el siguiente enlace:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://factupulse.com/verify?code=${code}" style="background-color: #ff99b2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
            Validar cuenta
          </a>
        </div>

        <p style="font-size: 14px; color: #888;">Si no creaste esta cuenta, simplemente ignorá este mensaje.</p>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; text-align: center; color: #aaa;">
          © ${new Date().getFullYear()} FactuPulse. Todos los derechos reservados.
        </p>
      </div>
    </div>
    `;

    await this.transporter.sendMail({
      from: '"FactuPulse" <factupulse@gmail.com>',
      to,
      subject: 'Bienvenido a FactuPulse 🎉',
      html,
    });
  }

  async sendEmployeeAccountCreatedEmail(
    to: string,
    name: string,
    email: string,
    code: string,
  ) {
    const loginUrl = 'https://factupulse.com/login';

    const html = `
    <div style="background-color: #fff3f6; padding: 30px; font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dszkopurc/image/upload/v1743191298/FactuPulse/property/mbmmvmzdkjllk5eqciuh.webp" alt="FactuPulse Logo" style="width: 100px; height: auto;" />
        </div>

        <h2 style="text-align: center; color: #333;">Tu cuenta fue creada en FactuPulse</h2>

        <p>Hola <strong>${name}</strong>,</p>

        <p>Te informamos que se ha creado una cuenta para vos en el sistema de gestión <strong>FactuPulse</strong>.</p>

        <p><strong>Usuario:</strong> ${email}</p>

        <p>Si esta es tu primera vez accediendo, hacé clic en el botón para ingresar y configurar tu contraseña.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #ff99b2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
            Iniciar sesión
          </a>
        </div>

        <p>Si no reconocés este registro o tenés dudas, comunicate con tu encargado o administrador.</p>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; text-align: center; color: #aaa;">
          © ${new Date().getFullYear()} FactuPulse. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

    await this.transporter.sendMail({
      from: '"FactuPulse" <factupulse@gmail.com>',
      to,
      subject: 'Tu cuenta fue creada en FactuPulse',
      html,
    });
  }

  async sendVerificationSuccessEmail(to: string, name: string) {
    const html = `
      <div style="background-color: #fff3f6; padding: 30px; font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dszkopurc/image/upload/v1743191298/FactuPulse/property/mbmmvmzdkjllk5eqciuh.webp" alt="FactuPulse Logo" style="width: 100px; height: auto;" />
      </div>

      <h2 style="text-align: center; color: #333;">¡Cuenta verificada con éxito!</h2>

      <p>Hola <strong>${name}</strong>,</p>

      <p>Tu dirección de correo electrónico fue verificada correctamente. Ya podés acceder a tu cuenta y comenzar a usar FactuPulse sin restricciones.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://factupulse.com/login" style="background-color: #00c48c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
          Iniciar sesión ahora
        </a>
      </div>

      <p style="font-size: 14px; color: #888;">Si no realizaste esta acción, te recomendamos cambiar tu contraseña o contactarnos.</p>

      <hr style="border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; text-align: center; color: #aaa;">
        © ${new Date().getFullYear()} FactuPulse. Todos los derechos reservados.
      </p>
    </div>
  </div>

  `;
    await this.transporter.sendMail({
      from: '"FactuPulse" <factupulse@gmail.com>',
      to,
      subject: '¡Tu cuenta ha sido verificada!',
      html,
    });
  }

  async sendResetPasswordEmail(to: string, name: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
    <div style="background-color: #fff3f6; padding: 30px; font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dszkopurc/image/upload/v1743191298/FactuPulse/property/mbmmvmzdkjllk5eqciuh.webp" alt="FactuPulse Logo" style="width: 100px; height: auto;" />
        </div>

        <h2 style="text-align: center; color: #333;">Recuperar contraseña</h2>

        <p>Hola <strong>${name}</strong>,</p>

        <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para continuar:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #ff99b2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
            Cambiar contraseña
          </a>
        </div>

        <p>Si no solicitaste este cambio, podés ignorar este mensaje.</p>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; text-align: center; color: #aaa;">
          © ${new Date().getFullYear()} FactuPulse. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

    await this.transporter.sendMail({
      from: '"FactuPulse" <factupulse@gmail.com>',
      to,
      subject: 'Solicitud de recuperación de contraseña',
      html,
    });
  }
}
