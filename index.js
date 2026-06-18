require('dotenv').config();
const express = require('express');
const cors = require('cors');
const hummRoutes = require('./routes/humm');
const productsRoutes = require('./routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://undervalueappliances.ca',
  'https://www.undervalueappliances.ca',
  'https://app.zenobuilder.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow this origin'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// JSON middleware for incoming request bodies
app.use(express.json());

// Mount Humm routes under /humm
app.use('/humm', hummRoutes);
// Mount product APIs under /api (GET /api/best-seller, GET /api/best-value)
app.use('/api', productsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.send('Humm Payment Server is running');
});

app.listen(PORT, () => {
  console.log(`Humm Payment Server started on port ${PORT}`);
});
