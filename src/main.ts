import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Fix: Serialize BigInt to string to prevent JSON.stringify errors
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation for all incoming requests
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Ensures Prisma shuts down gracefully
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
