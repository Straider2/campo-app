import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ms: Date.now() - start });
  });
  next();
}

export function errorLogger(err, req, res, next) {
  logger.error({ err: err.message, stack: err.stack, method: req.method, url: req.originalUrl });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor.' });
}
