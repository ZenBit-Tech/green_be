import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Session support (for LinkedIn OpenID Connect)
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ||
        'your-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '600000', 10), // Default: 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Lab AI Blood Test Analyzer API')
    .setDescription(
      'API documentation for OAuth authentication and blood test analysis',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag(
      'Authentication',
      'OAuth 2.0 (Google, LinkedIn) and Magic Link authentication',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📚 Swagger docs available at: ${await app.getUrl()}/api/docs`);
}

void bootstrap();
