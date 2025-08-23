import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
   app.enableCors({
    origin: process.env.FE,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter())
  app.use(express.json())
  app.useGlobalInterceptors();
  app.use(express.urlencoded({extended:true}));
  await app.listen(PORT, ()=> {
    console.log(`Server running on port http://localhost:${PORT}`)
  });
}
bootstrap();
