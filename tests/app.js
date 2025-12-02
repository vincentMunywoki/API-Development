const express = require('express');
const app = express();
// Add all middlewares, routes as in index.js (copy-paste, but remove app.listen)
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const postRoutes = require('../routes/posts');
const profileRoutes = require('../routes/profiles');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/profiles', profileRoutes);

module.exports = app;