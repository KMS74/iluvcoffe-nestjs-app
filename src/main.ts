import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unwanted properties from the incoming data
      forbidNonWhitelisted: true, // Throw an error if unwanted properties are present in the incoming data
      transform: true, // Automatically transform incoming data to the correct type Defined in DTO
      transformOptions: {
        enableImplicitConversion: true, // Automatically transform incoming data to the correct type
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
