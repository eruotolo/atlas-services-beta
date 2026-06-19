import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { PrismaExceptionFilter } from '@common/filters/prisma-exception.filter';
import { SerializeInterceptor } from '@common/interceptors/serialize.interceptor';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const rawOrigins = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

    // Seguridad: headers HTTP seguros
    app.use(helmet());

    // CORS: permite todos los orígenes configurados en FRONTEND_URL (separados por coma)
    app.enableCors({
        origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    });

    // Prefijo global para la API
    app.setGlobalPrefix('api/v1');

    // Versionado via URI
    app.enableVersioning({ type: VersioningType.URI });

    // Filtro global de errores Prisma
    app.useGlobalFilters(new PrismaExceptionFilter());

    // Interceptor global: elimina campos sensibles (password, etc.)
    app.useGlobalInterceptors(new SerializeInterceptor(app.get(Reflector)));

    // Validación global de DTOs
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

    // Swagger — solo en desarrollo
    if (nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Hireeo API')
            .setDescription('API REST para la plataforma Hireeo')
            .setVersion('1.0')
            .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'api-key')
            .addBearerAuth(
                { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                'access-token',
            )
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });

        console.log(`📄 Swagger disponible en: http://localhost:${port}/api/docs`);
    }

    await app.listen(port);
    console.log(`🚀 Backend corriendo en: http://localhost:${port}/api/v1`);
    console.log(`🌍 Entorno: ${nodeEnv}`);
}

bootstrap();
