import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Database - flexible for MySQL or SQLite
  DB_TYPE: Joi.string().valid('mysql', 'better-sqlite3').required(),
  DB_HOST: Joi.string().when('DB_TYPE', {
    is: 'mysql',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_PORT: Joi.number().when('DB_TYPE', {
    is: 'mysql',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_USER: Joi.string().when('DB_TYPE', {
    is: 'mysql',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_PASS: Joi.string().when('DB_TYPE', {
    is: 'mysql',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_NAME: Joi.string().when('DB_TYPE', {
    is: 'mysql',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_DATABASE: Joi.string().when('DB_TYPE', {
    is: 'better-sqlite3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN_SECONDS: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN_SECONDS: Joi.number().required(),

  MAGIC_LINK_EXPIRY_SECONDS: Joi.number().default(900),
  BACKEND_URL: Joi.string().uri().required(),
  EMAIL_FROM: Joi.string().email().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASS: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  LINKEDIN_CLIENT_ID: Joi.string().required(),
  LINKEDIN_CLIENT_SECRET: Joi.string().required(),
  LINKEDIN_CALLBACK_URL: Joi.string().uri().required(),

  SESSION_SECRET: Joi.string().required(),

  FRONTEND_URL: Joi.string().uri().required(),

  GEMINI_API_KEY: Joi.string().required(),
});
