require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Visensa API Server running`);
  console.log(`   ➜  Environment : ${NODE_ENV}`);
  console.log(`   ➜  Local       : http://localhost:${PORT}`);
  console.log(`   ➜  API Base    : http://localhost:${PORT}/api/v1\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});
