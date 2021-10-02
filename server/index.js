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
    .then((results) => res.json({
      product_id: req.query.product_id,
      results,
    }))
    .catch((err) => res.sendStatus(500));
});

app.get('/qa/questions/:id/answers', (req, res) => {
  db.getAnswersByQuestionID(req.params.id, res.query?.page, res.query?.count)
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
      res.json({
        question: req.params.id,
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

app.post('/qa/questions/:id/answers', (req, res) => {
  console.log(req.params.id, req.query.body, req.query.name, req.query.email, req.query?.photos);
  db.postAnswer(req.params.id, req.query.body, req.query.name, req.query.email, req.query?.photos)
    .then(() => {
      // console.log(response);
      res.sendStatus(201).end();
    })
    .catch((error) => console.error('error', error));
})

app.put('/qa/questions/:id/report', (req, res) => {
  db.report(questions, req.params.id)
    .then(() => res.sendStatus(204).end())
    .catch((error) = console.error(error));
})

app.put('/qa/answers/:id/report', (req, res) => {
  db.report(answers, req.params.id)
    .then(() => res.sendStatus(204).end())
    .catch((error) = console.error(error));
})

app.listen(PORT, () => {
  console.log('Listening on port: ', PORT);
});
