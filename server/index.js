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
      let promiseQ = dataQ.map((question) => {
        return db.getAllAnswersByQuestionID(question.question_id)
          .then((answers) => {
            let promiseA = answers.map((ans) => {
              return db.getPhotosByAnswersID(ans.id)
                .then((photoArr) => {
                  return photoArr.map((photo) => photo.url);
                })
                .catch((err) => console.error(err));
            })
            return Promise.all(promiseA)
              .then((promisePhotos) => {
                console.log('promise photos:', promisePhotos);
                return answers.map((a, i) => {
                  return {
                    id: a.id,
                    body: a.body,
                    date: a.date,
                    answerer_name: a.answerer_name,
                    helpfulness: a.helpful,
                    photos: promisePhotos[i],
                  };
                });
              })
              .catch((err) => console.error(err));
          })
          .catch((err) => console.error(err));
      })
      return Promise.all(promiseQ)
        .then((promiseResults) => {
          console.log('PROMISE RESULTS:', promiseResults);
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
        .catch((err) => console.error(err));
    })
    .then((results) => res.json({
      product_id: req.query.product_id,
      results,
    }))
    .catch((err) => console.error(err));
});

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
