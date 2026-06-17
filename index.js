require('dotenv').config();
const express = require('express');
const hummRoutes = require('./routes/humm');
const productsRoutes = require('./routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON middleware for incoming request bodies
app.use(express.json());

// Mount Humm routes under /humm
app.use('/humm', hummRoutes);
// Mount product APIs under /api (GET /api/best-seller, GET /api/best-value)
app.use('/api', productsRoutes);

app.get('/', (req, res) => {
  res.send('Humm Payment Server is running');
});

app.listen(PORT, () => {
  console.log(`Humm Payment Server started on port ${PORT}`);
});
