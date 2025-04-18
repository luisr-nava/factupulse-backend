import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_PORT: number;
  DB_PASS: string;
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  JWT_SECRET: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  CLOUDINART_NAME: string;
  CLOUDINART_API_KEY: string;
  CLOUDINART_API_SECRET: string;
}
const logger = new Logger('FactuPulse - ERROR');

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_PORT: joi.number().required(),
    DB_PASS: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_USER: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    SMTP_USER: joi.string().required(),
    SMTP_PASS: joi.string().required(),
    CLOUDINART_NAME: joi.string().required(),
    CLOUDINART_API_KEY: joi.string().required(),
    CLOUDINART_API_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  logger.error(error);
  console.log(error.message);

  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbPort: envVars.DB_PORT,
  dbPassword: envVars.DB_PASS,
  dbHost: envVars.DB_HOST,
  dbName: envVars.DB_NAME,
  dbUsername: envVars.DB_USER,
  jwtSecret: envVars.JWT_SECRET,
  smtpUser: envVars.SMTP_USER,
  smtpPass: envVars.SMTP_PASS,
  cloudinaryName: envVars.CLOUDINART_NAME,
  cloudinaryApiKey: envVars.CLOUDINART_API_KEY,
  cloudinaryApiSecret: envVars.CLOUDINART_API_SECRET,
};
