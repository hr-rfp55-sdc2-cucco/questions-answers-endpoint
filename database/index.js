/* eslint-disable prefer-const */
/* eslint-disable no-console */
const { Pool } = require('pg');
const { DBTOKEN } = require('../config');

const pool = new Pool({
  user: 'ubuntu',
  host: '3.101.54.225',
  database: 'sdc2db',
  password: DBTOKEN,
  port: 5432,
});

const getQuestionsByProductID = (productID, page = 1, count = 5) => {
  let queryStr = 'SELECT * FROM questions WHERE product_id = $1 AND reported = false OFFSET $2 LIMIT $3';
  let queryArgs = [productID, (page - 1) * count, count];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

const getAllAnswersByQuestionID = (questionID) => {
  let queryStr = 'SELECT * FROM answers WHERE question_id = $1';
  let queryArgs = [questionID];
  // console.log('GOING INTO GET ALL');
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

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
};

const getAnswersByQuestionID = (questionID, page = 1, count = 5) => {
  let queryStr = 'SELECT id AS answer_id, body, date, answerer_name, helpful AS helpfulness FROM answers WHERE question_id = $1 AND reported = false OFFSET $2 LIMIT $3';
  let queryArgs = [questionID, (page - 1) * count, count];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

const getPhotosByAnswersID = (answerID) => {
  let queryStr = 'SELECT id, url FROM answerphotos WHERE answer_id = $1';
  let queryArgs = [answerID];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => {
      // pool.end();
      return res.rows;
    })
    .catch((error) => console.error(error.stack));
};

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
  getQuestionsByProductID,
  getAllAnswersByQuestionID,
  getAnswersByQuestionID,
  getPhotosByAnswersID,
  postQuestion,
  postAnswer,
  report,
  helpful,
  getAnswersWithPhotos
};
