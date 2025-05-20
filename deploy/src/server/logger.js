// Advanced logging configuration for the Smart Retail Assistant

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module polyfills for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log formats
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'smart-retail-assistant' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Write to file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Create log directory if it doesn't exist
import fs from 'fs';
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Add API request logging middleware
export const requestLogger = (req, res, next) => {
  const start = new Date();
  res.on('finish', () => {
    const responseTime = new Date() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('user-agent'),
      query: req.method === 'POST' ? req.body : req.query
    });
  });
  next();
};

// Add error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error('Server Error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body
  });
  next(err);
};

export default logger;
