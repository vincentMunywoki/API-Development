const db = require('./models');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {sequelize} = require('./models');
const { Connection } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//Test route
app.get('/', (req, res) => res.send('API is running!'));

//sync database for development

db.sequelize.authenticate()
.then(() => console.log('Database connected!'))
.catch(err => console.error('Connection error:', err));
