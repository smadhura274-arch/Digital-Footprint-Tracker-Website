require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || 'localhost';
const hasExplicitPort = Boolean(process.env.PORT);

function logServerUrls(port) {
  const baseUrl = `http://${HOST}:${port}`;
  console.log(`Server running on port ${port}`);
  console.log(`Local: ${baseUrl}/`);
  console.log(`API: ${baseUrl}/api`);
  console.log(`Health Check: ${baseUrl}/health`);
}

function listenOnPort(port) {
  const server = app.listen(port, () => {
    logServerUrls(port);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on port ${nextPort}...`);
      listenOnPort(nextPort);
      return;
    }

    console.error(`Server failed to listen on port ${port}:`, error.message);
    process.exit(1);
  });
}

async function startServer() {
  try {
    await connectDB();
    listenOnPort(DEFAULT_PORT);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
