const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const slackTemplate = require('./utils/slackTemplate');
const app = express();

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const dbUrl = process.env.BD_URL || '';
const PORT = process.env.PORT || 3000;
let database;

app.use(bodyParser.json());

MongoClient.connect(dbUrl, {
  useUnifiedTopology: true
}, (err, mongodb) => {
  if (err) return console.error(err);
  console.log('Connected to Database');
  database = mongodb;
});

app.get('/', (request, response) => {
  response.send('¡Hola Mundo Cruel!');
});

app.get('/quotes', (request, response) => {
  const data = database.db('platzi-quotes');
  const collectionQuotes = data.collection('quotes');
  collectionQuotes.find().toArray()
    .then(results => {
      response.json({ results })
    })
    .catch(err => console.log(err));
});

app.post('/slackQuotes', (request, response) => {
  const data = database.db('platzi-quotes');
  const collectionQuotes = data.collection('quotes');
  collectionQuotes.find().toArray()
    .then(results => {
      let slack = slackTemplate(results[0]);
      response.json(slack);
    })
    .catch(err => console.log(err));
})

app.post('/quotes', (request, response) => {
  const data = database.db('platzi-quotes');
  const collectionQuotes = data.collection('quotes');
  collectionQuotes.insertOne(request.body)
    .then(results => {
      response.json(results.ops);
    })
    .catch(err => {
      console.log(err)
      response.status(500);
    });
});

app.put('/quotes', (request, response) => {
  const data = database.db('platzi-quotes');
  const collectionQuotes = data.collection('quotes');
  collectionQuotes.findOneAndUpdate({
    _id: request.body._id
  }, {
    $set: {
      name: request.body.name,
      quote: request.body.quote
    }
  }, {
    upsert: true
  })
    .then(results => {
      response.json(results);
    })
    .catch(err => {
      console.log(err);
      response.status(500);
    })
});

app.delete('/quotes', (request, response) => {
  const data = database.db('platzi-quotes');
  const collectionQuotes = data.collection('quotes');
  collectionQuotes.deleteOne({
    name: request.body.name
  })
    .then(results => {
      response.json(results);
    })
    .catch(err => console.log(err));
});

app.listen(PORT, function () {
  console.log('Servidor funcionando http://localhost:3000')
});