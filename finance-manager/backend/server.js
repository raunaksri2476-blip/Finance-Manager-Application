const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Finance Manager API is healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
