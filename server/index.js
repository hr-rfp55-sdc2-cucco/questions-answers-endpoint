/* eslint-disable radix */
/* eslint-disable no-console */
const express = require('express');
const db = require('../database');
const newRelic = require('newrelic');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.end('Hello World');
});

app.get('/loaderio-f3e5be8d0a10ae98ae742adb69551559', (req, res) => {
  res.end('loaderio-f3e5be8d0a10ae98ae742adb69551559');
})

app.get('/qa/questions', (req, res) => {
  db.getQuestionsWithAnswersWithPhotos(parseInt(req.query.product_id), req.query?.page, req.query?.count)
    .then((results) => {
      return res.json({
        product_id: req.query.product_id,
        results
      });
    })
    .catch((e) => res.sendStatus(500));
})

app.get('/qa/questions/:question_id/answers', (req, res) => {
  db.getAnswersWithPhotos(req.params.question_id, res.query?.page, res.query?.count)
    .then((results) => res.json({
      question: req.params.question_id,
      page: res.query?.page || 1,
      count: res.query?.count || 5,
      results,
    }))
    .catch((e) => res.sendStatus(500));
})

app.post('/qa/questions', (req, res) => {
  db.postQuestion(req.query.product_id, req.query.body, req.query.name, req.query.email)
    .then((response) => res.sendStatus(201).end())
    .catch((error) => console.error(error));
})

app.post('/qa/questions/:question_id/answers', (req, res) => {

  db.postAnswer(req.params.question_id, req.body.body, req.body.name, req.body.email, req.body?.photos)
    .then(() => {
      res.sendStatus(201).end();
    })
    .catch((error) => console.error('error', error));
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  db.report('questions', req.params.question_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  db.report('answers', req.params.answer_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  db.helpful('questions', req.params.question_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  db.helpful('answers', req.params.answer_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});