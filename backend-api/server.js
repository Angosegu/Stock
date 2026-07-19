const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for external access (essential for EXE / Web clients)
app.use(cors({
  origin: '*', // Allow all origins, customize as needed for production security
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Professional connection and request logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Default server check endpoint
app.get('/', (req, res) => {
  res.json({
    status: "ONLINE",
    message: "Servidor de API VBSP operacional e seguro.",
    timestamp: new Date().toISOString()
  });
});

// Register routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// Global Error Handler (Prevents server crashes on unhandled logic exceptions)
app.use((err, req, res, next) => {
  console.error('❌ [Erro Crítico Servidor]:', err.stack || err.message || err);
  res.status(500).json({
    success: false,
    error: 'Ocorreu um erro interno no servidor de API.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🚀 SERVIDOR API VBSP EM FUNCIONAMENTO`);
  console.log(`📡 Endereço local: http://localhost:${PORT}`);
  console.log(`🌐 Host público:   http://0.0.0.0:${PORT}`);
  console.log(`📅 Iniciado em:    ${new Date().toLocaleString()}`);
  console.log(`==================================================`);
});
