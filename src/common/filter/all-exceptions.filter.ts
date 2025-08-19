// src/common/filters/all-exceptions.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  interface ErrorResponse {
    message: string;
    [key: string]: any;
  }
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx      = host.switchToHttp();
      const response = ctx.getResponse();
      const status   = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      const res = exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };
  
      let message: string;
      if (typeof res === 'string') {
        message = res;
      } else {
        message = (res as ErrorResponse).message ?? 'Internal server error';
      }

      response
        .status(HttpStatus.OK)
        .json({
          success: false,
          statusCode: status,
          message,
        });
    }
  }
  