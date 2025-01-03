const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const helmet = require('helmet');

const userRoutes = require('./routes/user')
const bookRoutes = require('./routes/books')
const app = express();

mongoose.connect(`mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@cluster0.ygfwthu.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes)

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
