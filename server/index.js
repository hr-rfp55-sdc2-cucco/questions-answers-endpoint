/* eslint-disable radix */
/* eslint-disable no-console */
const express = require('express');
const db = require('../database');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.end('Hello World');
});

app.get('/qa/questions', (req, res) => {
  db.getQuestionsByProductID(parseInt(req.query.product_id), req.query?.page, req.query?.count)
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
                // console.log('promise photos:', promisePhotos);
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
          // console.log('PROMISE RESULTS:', promiseResults);
          return dataQ.map((q, i) => {
            let ansObj = {};
            promiseResults[i].forEach((ans) => ansObj[ans.id] = ans);
            return {
              question_id: q.id,
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
    .then((results) => {
      console.log('got questions for:', req.query.product_id);
      return res.json({
        product_id: req.query.product_id,
        results,
      });
    })
    .catch((err) => res.sendStatus(500));
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  console.log('params:', req.params, 'query', req.query)
  db.getAnswersByQuestionID(req.params.question_id, res.query?.page, res.query?.count)
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
          // console.log('promise photos:', promisePhotos);
          return answers.map((a, i) => {
            return {
              answer_id: a.id,
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
    .then((results) => {
      console.log('got answers for for:', req.params.question_id);
      return res.json({
        question: req.params.question_id,
        page: res.query?.page || 1,
        count: res.query?.count || 5,
        results,
      });
    })
    .catch((err) => res.sendStatus(500));
})

app.post('/qa/questions', (req, res) => {
  console.log(req.query);
  db.postQuestion(req.query.product_id, req.query.body, req.query.name, req.query.email)
    .then((response) => res.sendStatus(201).end())
    .catch((error) => console.error(error));
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  // console.log('trying to post answer', req.params, req.query);
  db.postAnswer(req.params.question_id, req.query.body, req.query.name, req.query.email, req.query?.photos)
    .then(() => {
      // console.log(response);
      res.sendStatus(201).end();
    })
    .catch((error) => console.error('error', error));
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  console.log('report an answer', req);
  db.report('questions', req.params.question_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  // console.log('report an answer', req);
  db.report('answers', req.params.answer_id)
    .then(() => res.sendStatus(204).end())
    .catch((error) => console.error(error));
})

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
