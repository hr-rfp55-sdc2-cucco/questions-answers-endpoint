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
      dataQ.forEach((q) => {
        let answers = [];
        db.getAllAnswersByQuestionID(q.question_id)
          .then((dataA) => {
            dataA.forEach((a) => {
              answers.push({
                answer_id: a.answer_id,
                body: a.body,
                date: a.date,
                answerer_name: a.answerer_name,
                helpfulness: a.helpful,
                photos: [],
              })
            })
          })
          .then(() => {
            results.push({
              question_id: q.question_id,
              question_body: q.question_body,
              question_date: q.question_date,
              asker_name: q.asker_name,
              question_helpfulness: q.helpful,
              reported: q.reported,
              answers,
            });
          })
          .catch((err) => console.error(err));
      })
      let returnObj = {
        product_id: req.query.product_id,
        results,
      };
      console.log('data from query', returnObj);
    })
    .catch((err) => console.error(err));
  // console.log(req.query);
  res.end();
});

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
