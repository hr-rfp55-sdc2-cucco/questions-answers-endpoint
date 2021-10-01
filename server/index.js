/* eslint-disable radix */
/* eslint-disable no-console */
const express = require('express');
const db = require('../database');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.end('Hello World');
});

app.get('/qa/questions', (req, res) => {
  db.getQuestionsByProductID(
    parseInt(req.query.product_id),
    req.query?.page,
    req.query?.count
  )
    .then((dataQ) => {
      let results = [];
      let promiseQ = dataQ.map((question) => {
        return db.getAllAnswersByQuestionID(question.question_id)
          .then((answers) => answers.map((a) => {
            return {
              id: a.id,
              body: a.body,
              date: a.date,
              answerer_name: a.answerer_name,
              helpfulness: a.helpful,
              photos: [],
            }
          }))
      })
      Promise.all(promiseQ)
        .then((promiseResults) => {
          // console.log(promiseResults);
          return dataQ.map((q, i) => {
            let ansObj = {};
            promiseResults[i].forEach((ans) => ansObj[ans.id] = ans);
            return {
              question_id: q.question_id,
              question_body: q.question_body,
              question_date: q.question_date,
              asker_name: q.asker_name,
              question_helpfulness: q.helpful,
              reported: q.reported,
              answers: ansObj,
            }
          });
        })
        .then((results) => res.json({
          product_id: req.query.product_id,
          results,
        }))
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
