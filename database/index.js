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
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

const getAnswersByQuestionID = (questionID, page = 1, count = 5) => {
  let queryStr = 'SELECT * FROM answers WHERE question_id = $1 OFFSET $2 LIMIT $3';
  let queryArgs = [questionID, (page - 1) * count, count];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

const getPhotosByAnswersID = (answerID, page = 1, count = 5) => {
  let queryStr = 'SELECT * FROM answerphotos WHERE answer_id = $1';
  let queryArgs = [answerID, (page - 1) * count, count];
  // console.log(queryArgs);
  return pool
    .query(queryStr, queryArgs)
    .then((res) => res.rows)
    .catch((error) => console.error(error.stack));
};

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
};
