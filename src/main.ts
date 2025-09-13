import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Set default environment variables if not provided
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-here';
  }
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  if (!process.env.PORT) {
    process.env.PORT = '3000';
  }

  const app = await NestFactory.create(AppModule);

  // Initialize database
  const prismaService = app.get(PrismaService);
  await prismaService.onModuleInit();

  // Enable CORS for mobile app
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Sales Scorecard API')
    .setDescription('API for Sales Scorecard mobile application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Add a simple health check endpoint
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Sales Scorecard API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        admin: '/public-admin/panel',
        test: '/public-admin/test',
        docs: '/api/docs'
      }
    });
  });

  // Add a direct test endpoint
  app.getHttpAdapter().get('/test-admin', (req, res) => {
    res.json({ 
      message: 'Direct admin test endpoint working!',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 3000,
      host: req.headers.host
    });
  });

  const port = process.env.PORT || 8080;
  
  // Ensure we're listening on the correct interface
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Sales Scorecard API running on port ${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🌐 External access: http://0.0.0.0:${port}`);
  });
}

bootstrap();
