import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Node
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Database
  DB_TYPE: Joi.string()
    .valid('sqlite', 'better-sqlite3', 'mysql')
    .default('sqlite'),
  DB_HOST: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
  DB_PORT: Joi.number().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
  DB_USER: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
  DB_PASS: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
  DB_NAME: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
  DB_DATABASE: Joi.string().when('DB_TYPE', {
    is: Joi.string().regex(/sqlite/),
    then: Joi.required(),
  }),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN_SECONDS: Joi.number().default(900),
  JWT_REFRESH_EXPIRES_IN_SECONDS: Joi.number().default(604800),

  // Magic Link
  MAGIC_LINK_EXPIRY_SECONDS: Joi.number().default(900),
  BACKEND_URL: Joi.string().uri().required(),

  // Email
  EMAIL_FROM: Joi.string().email().required(),

  // OAuth - Google
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // OAuth - LinkedIn
  LINKEDIN_CLIENT_ID: Joi.string().required(),
  LINKEDIN_CLIENT_SECRET: Joi.string().required(),
  LINKEDIN_CALLBACK_URL: Joi.string().uri().required(),

  // Session
  SESSION_SECRET: Joi.string().required(),

  // Frontend
  FRONTEND_URL: Joi.string().uri().required(),
});
