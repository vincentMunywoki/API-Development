const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {sequelize} = require('./models');
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

sequelize.sync()
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 
})
.catch(err => console.error('Database sync error:', err));