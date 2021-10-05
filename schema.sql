-- CREATE TABLE products (
--   id bigserial,
--   product_id int PRIMARY KEY
-- );

DROP TABLE answerphotos;
DROP TABLE answers;
DROP TABLE questions;


CREATE TABLE questions (
  id serial PRIMARY KEY,
  product_id int,
  question_body text,
  question_date bigint,
  asker_name varchar,
  asker_email varchar,
  reported boolean,
  helpful int
);

CREATE TABLE answers (
  id serial PRIMARY KEY,
  question_id int REFERENCES questions (id),
  body text,
  date bigint,
  answerer_name varchar,
  answerer_email varchar,
  reported boolean,
  helpful int
);


CREATE TABLE answerphotos (
  id serial PRIMARY KEY,
  answer_id int REFERENCES answers (id),
  url text
);

COPY questions FROM '/Users/ilee/Documents/HackReactor/AtelierCleanData/questions.csv' WITH (FORMAT csv, header);

COPY answers FROM '/Users/ilee/Documents/HackReactor/AtelierCleanData/answers.csv' WITH (FORMAT csv, header);

COPY answerphotos FROM '/Users/ilee/Documents/HackReactor/AtelierCleanData/answers_photos.csv' WITH (FORMAT csv, header);

ALTER TABLE questions
    ALTER COLUMN question_date SET DATA TYPE timestamp with time zone
    USING
        timestamp with time zone 'epoch' + question_date * interval '1 millisecond';

ALTER TABLE answers
    ALTER COLUMN date SET DATA TYPE timestamp with time zone
    USING
        timestamp with time zone 'epoch' + date * interval '1 millisecond';

-- SELECT setval(‘questions_question_id_seq’,3518964, true);
-- SELECT setval(‘answers_id_seq’,6879307, true);
-- SELECT setval(‘answersphotos_id_seq’,2063760, true);

CREATE INDEX questions_btree_index ON questions (product_id, reported);
CREATE INDEX answers_btree_index ON answers (question_id, reported);
CREATE INDEX answerphotos_btree_index ON answerphotos (answer_id);

SELECT setval(pg_get_serial_sequence('questions', 'id'), 3518963);
SELECT setval(pg_get_serial_sequence('answers', 'id'), 6879306);
SELECT setval(pg_get_serial_sequence('answerphotos', 'id'), 2063759);

-- INSERT INTO answers (question_id, body, date, answerer_name, answerer_email, reported, helpful) VALUES ('1', 'world hello', current_timestamp(3), 'pls work', 'first.last@gmail.com', false, 0) RETURNING id;

-- update answers set body = 'fix', answerer_name = 'bug', answerer_email = 'first.laste@gmail.com' WHERE id = 6879318;

CREATE INDEX questions_hash_index ON questions USING hash (product_id);
CREATE INDEX answers_hash_index ON answers USING hash (question_id);
CREATE INDEX answerphotos_hash_index ON answerphotos USING hash (answer_id);

SELECt * FROM answers where question_id = 1;

SELECT
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
  WHERE answers.question_id = 1
    AND answers.reported = false
  GROUP BY answers.id
  OFFSET 0 ROWS
  LIMIT 10;