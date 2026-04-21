import ApiError from '../utils/ApiError.js';
import logger   from '../utils/logger.js';

export const globalErrorHandler = (err, req, res, _next) => {
  const status  = err.statusCode ?? 500;
  const isProd  = process.env.NODE_ENV === 'production';

  // Structured log
  logger.error({
    method:  req.method,
    url:     req.originalUrl,
    status,
    message: err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ status: 'error', message: messages.join(', ') });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'error', message: 'Invalid ID format' });
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({ status: 'error', message: `${field} already exists` });
  }

  // JWT / Firebase
  if (err.code === 'auth/id-token-expired') {
    return res.status(401).json({ status: 'error', message: 'Session expired — please sign in again' });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status:  'error',
      message: err.message,
      ...(isProd ? {} : { stack: err.stack }),
    });
  }

  return res.status(500).json({
    status:  'error',
    message: isProd ? 'Internal server error' : err.message,
  });
};