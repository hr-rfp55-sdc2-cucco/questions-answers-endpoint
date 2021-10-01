/* eslint-disable radix */
/* eslint-disable no-console */
const express = require('express');
const db = require('../database');

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.end('Hello World');
});

app.get('/qa/questions', (req, res) => {
  db.getQuestionsByProductID(
    parseInt(req.query.product_id),
    req.query?.page,
    req.query?.count
  );
  console.log(req.query);
  res.end();
});

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
