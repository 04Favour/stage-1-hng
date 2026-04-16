import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const r = exceptionResponse as Record<string, unknown>;
      message = Array.isArray(r.message)
        ? (r.message as string[])[0]
        : (r.message as string) ?? 'An error occurred';
    } else {
      message = 'An error occurred';
    }

    response.status(status).json({
      status: 'error',
      message,
    });
  }
}