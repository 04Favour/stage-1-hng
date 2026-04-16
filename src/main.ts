import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  app.useGlobalFilters(new HttpExceptionFilter()); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const constraints = first?.constraints ?? {};
        const msg = Object.values(constraints)[0] as string ?? 'Validation failed';
        const isTypeProblem =
          msg.toLowerCase().includes('string') ||
          msg.toLowerCase().includes('must be');

        return isTypeProblem
          ? new UnprocessableEntityException(msg)
          : new BadRequestException(msg);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3009);
}
bootstrap();