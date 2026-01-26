import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // Cookie parser (must be before other middleware that uses cookies)
  app.use(cookieParser());

  // CORS with credentials for cookie-based auth
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',  // application
      'http://localhost:3001',  // api
      'http://localhost:3002',  // platform-manager
      'http://localhost:3003',  // tenant-admin
      'http://localhost:3004',  // member-portal
      'http://localhost:3005',  // marketing
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'ready'],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ClubVantage API')
      .setDescription('Club Management ERP API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Members', 'Member management')
      .addTag('Billing', 'Invoices and payments')
      .addTag('Golf', 'Golf bookings and tee times')
      .addTag('Bookings', 'Facility bookings')
      .addTag('Users', 'User management')
      .addTag('Settings', 'Club settings')
      .addTag('Reports', 'Analytics and reports')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
    =============================================
    ClubVantage API is running!

    Environment: ${process.env.NODE_ENV || 'development'}
    Port: ${port}
    API Docs: http://localhost:${port}/api/docs
    =============================================
  `);
}

bootstrap();
