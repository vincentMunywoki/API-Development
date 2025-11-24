require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const db = require('./models');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express(); // <-- CREATE APP FIRST
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/users', userRoutes); // <-- AFTER app is defined
app.use('/posts', postRoutes);

// Test route
app.get('/', (req, res) => res.send('API is running!'));

// Sync / authenticate database
db.sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('Connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
