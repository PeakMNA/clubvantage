import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Security - Configure Helmet properly for GraphQL
  app.use(
    helmet({
      // Disable CSP in development to allow GraphQL Playground
      // In production, configure CSP properly for your needs
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
            },
          }
        : false,
      // Allow GraphQL Playground to work with cross-origin resources
      crossOriginEmbedderPolicy: isProduction,
      // Required for GraphQL Playground in non-production
      crossOriginResourcePolicy: isProduction ? { policy: 'same-origin' } : false,
    }),
  );

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

  logger.log('=============================================');
  logger.log('ClubVantage API is running!');
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Port: ${port}`);
  if (!isProduction) {
    logger.log(`API Docs: http://localhost:${port}/api/docs`);
    logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
  }
  logger.log('=============================================');
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
