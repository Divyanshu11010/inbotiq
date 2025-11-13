import { ZodError } from 'zod';

export function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
}
