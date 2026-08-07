const { supabase } = require('./config/supabase.js');

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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    // Parse multiple comma-separated URLs if provided
    if (process.env.CORS_ORIGIN) {
      process.env.CORS_ORIGIN.split(',').forEach(url => allowedOrigins.push(url.trim()));
    }

    // Allow requests with no origin (like Postman or curl) or if origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
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

// ===============================
// DB TEST
// ===============================
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctor')
      .select('*')
      .limit(5);

    if (error) throw error;

    res.json({
      status: 'success',
      message: 'Berhasil nyambung ke Supabase!',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
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
