const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const routes = require('./routes');
const { globalErrorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { responseFormatter } = require('./middlewares/responseFormatter');

const app = express();

// ==============================
// Security Middlewares
// ==============================
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==============================
// Performance Middlewares
// ==============================
app.use(compression());

// ==============================
// Logging
// ==============================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ==============================
// Body Parsing
// ==============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================
// Response Formatter
// ==============================
app.use(responseFormatter);

// ==============================
// Health Check
// ==============================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Visensa API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ==============================
// API Routes
// ==============================
app.use('/api/v1', routes);

// ==============================
// Error Handlers
// ==============================
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
