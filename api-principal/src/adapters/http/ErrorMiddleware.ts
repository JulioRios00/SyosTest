
import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/ports/ILogger';

export class ErrorMiddleware {
  constructor(private readonly logger: ILogger) {}

  handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    this.logger.error('Request error', err, {
      method: req.method,
      url: req.url,
      body: req.body,
    });

    const status = (err as any).status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
      success: false,
      error: {
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }
}
