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
  let queryStr = 'SELECT * FROM questions WHERE id = ? OFFSET ?';
  let queryArgs = [productID, (page - 1) * count];
  return pool
    .query(queryStr, queryArgs)
    .then((res) => console.log(res.rows))
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

module.exports = { getQuestionsByProductID };
