const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const net = require('net');
const { execSync } = require('child_process');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const { errorHandler, notFound } = require('./middleware/error');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = 5000;
const preferredPort = Number.parseInt(process.env.PORT, 10) || DEFAULT_PORT;
let serverInstance = null;

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', (error) => {
      tester.close(() => resolve(false));
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, '0.0.0.0');
  });

const getPortOwner = (port) => {
  if (process.platform !== 'darwin' && process.platform !== 'linux') {
    return null;
  }

  try {
    const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -Fpc`, { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const info = {};

    lines.forEach((line) => {
      if (line.startsWith('p')) {
        info.pid = parseInt(line.slice(1), 10);
      }
      if (line.startsWith('c')) {
        info.command = line.slice(1);
      }
    });

    if (info.pid && info.command) {
      return info;
    }
  } catch (err) {
    return null;
  }

  return null;
};

const canSafelyKill = (command) => /node|nodemon/i.test(command);

const killPortOwner = (port) => {
  const owner = getPortOwner(port);
  if (!owner || !owner.pid || !canSafelyKill(owner.command)) {
    return false;
  }

  try {
    process.kill(owner.pid, 'SIGTERM');
    return true;
  } catch (err) {
    return false;
  }
};

const findAvailablePort = async (startPort) => {
  let port = startPort;
  const maxPort = startPort + 100;

  while (port <= maxPort) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }

    const owner = getPortOwner(port);
    if (owner) {
      console.warn(`Port ${port} is in use by PID ${owner.pid} (${owner.command}).`);
      if (killPortOwner(port)) {
        console.log(`Attempted to terminate ${owner.command} on port ${port}. Waiting for release...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryAvailable = await isPortAvailable(port);
        if (retryAvailable) {
          return port;
        }
      }
    } else {
      console.warn(`Port ${port} is currently occupied.`);
    }

    port += 1;
  }

  throw new Error(`No available ports found between ${startPort} and ${maxPort}.`);
};

const createServer = (port) =>
  new Promise((resolve, reject) => {
    const server = http.createServer(app);

    server.once('error', reject);
    server.once('listening', () => resolve(server));
    server.listen(port);
  });

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down backend gracefully...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Backend server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const startApplication = async () => {
  try {
    const port = await findAvailablePort(preferredPort);
    serverInstance = await createServer(port);
    console.log(' Backend Server Running');
    console.log(' Listening on Port ' + port);
    console.log(' Node environment: ' + (process.env.NODE_ENV || 'development'));
  } catch (err) {
    console.error('Failed to start server: ' + err.message);
    process.exit(1);
  }
};

connectDB()
  .then(() => {
    console.log(' Database synchronized');
    app.locals.routesLoaded = true;
    startApplication();
  })
  .catch((err) => {
    console.error('Failed to start server: ' + err.message);
    process.exit(1);
  });
