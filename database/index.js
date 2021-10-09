/* eslint-disable prefer-const */
/* eslint-disable no-console */
const { Pool } = require('pg');
// const { DBTOKEN } = require('../config');

const pool = new Pool({
  user: 'ilee',
  host: 'localhost',
  database: 'sdc2db',
  // password: DBTOKEN,
  port: 5432,
});


const getQuestionsWithAnswersWithPhotos = (productID, page = 1, count = 5) => {
  let queryStr = `
  SELECT
    questions.id AS question_id,
    questions.question_body,
    questions.question_date,
    questions.asker_name,
    questions.helpful AS question_helpfulness,
    questions.reported,
    COALESCE(
      JSON_AGG(
        json_build_object(
          'id', answers.id,
          'body', answers.body,
          'data', answers.date,
          'answerer_name', answers.answerer_name,
          'helpfulness', answers.helpful,
          'photos', (
                  select coalesce(json_agg(
                      t.url
                    ), '[]'::json) from
                    (SELECT
                        answerphotos.url
                  FROM answerphotos WHERE answerphotos.answer_id = answers.id) AS t
                )
        )
      ) FILTER (WHERE answers.id IS NOT NULL)
    , '[]'
    )
    AS answers
    FROM questions
    LEFT JOIN answers ON questions.id = answers.question_id
    WHERE questions.product_id = $1 and questions.reported = false
    GROUP BY questions.id
    OFFSET $2
    LIMIT $3
    `;
  let queryArgs = [productID, (page - 1) * count, count];
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
}

const getAnswersWithPhotos = (questionID, page = 1, count = 5) => {
  let queryStr = `SELECT
  answers.id AS answer_id,
  answers.body,
  answers.date,
  answers.answerer_name,
  answers.helpful AS helpfulness,
  COALESCE(
    JSON_AGG(
      json_build_object(
        'id', answerphotos.id,
        'url', answerphotos.url)
      ORDER BY answerphotos.id ASC
      )
    FILTER (WHERE answerphotos.id IS NOT NULL)
    , '[]')
    AS photos
  FROM answers
  LEFT JOIN answerphotos
    ON answers.id = answerphotos.answer_id
  WHERE answers.question_id = $1
    AND answers.reported = false
  GROUP BY answers.id
  OFFSET $2 ROWS
  LIMIT $3`;
  let queryArgs = [questionID, (page - 1) * count, count];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
}

const postQuestion = (productID, body, name, email) => {
  let queryStr = 'INSERT INTO questions (product_id, question_body, question_date, asker_name, asker_email, reported, helpful) VALUES ($1, $2, current_timestamp(3), $3, $4, false, 0)';
  let queryArgs = [productID, body, name, email];
  return pool.query(queryStr, queryArgs);
}

const postAnswer = (questionID, body, name, email, photos = []) => {
  let queryStr = 'INSERT INTO answers (question_id, body, date, answerer_name, answerer_email, reported, helpful) VALUES ($1, $2, current_timestamp(3), $3, $4, false, 0) RETURNING id';
  let queryArgs = [questionID, body, name, email];
  return pool.query(queryStr, queryArgs)
    .then((res) => {
      if (photos) {
        // console.log(photos);
        return photos.map((photo) => {
          let queryStr = 'INSERT INTO answerphotos (answer_id, url) VALUES ($1, $2)';
          let queryArgs = [res.rows[0].id, photo];
          return pool.query(queryStr, queryArgs)
            .catch((err) => console.error(err));
        })
      } else { return }
    })
    .catch((err) => console.error(err));
}

const report = (flag, id) => {
  let queryStr = `UPDATE ${flag} SET reported = true WHERE id = $1`;
  let queryArgs = [id];
  // console.log('report params:', queryArgs);
  return pool.query(queryStr, queryArgs)
}

const helpful = (flag, id) => {
  let queryStr = `UPDATE ${flag} SET helpful = helpful + 1 WHERE id = $1`;
  let queryArgs = [id];
  // console.log('helpfulness params:', queryArgs);
  return pool.query(queryStr, queryArgs)
}

// pool
//   .query('SELECT * FROM questions LIMIT 7')
//   .then((res) => {
//     console.log('success', res.rows);
//     pool.end();
//   })
//   .catch((e) => console.error(e.stack));

// pool.end();

module.exports = {
  postQuestion,
  postAnswer,
  report,
  helpful,
  getAnswersWithPhotos,
  getQuestionsWithAnswersWithPhotos
};
