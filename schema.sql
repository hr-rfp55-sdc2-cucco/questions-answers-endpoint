-- CREATE TABLE products (
--   id bigserial,
--   product_id int PRIMARY KEY
-- );

DROP TABLE answerphotos;
DROP TABLE answers;
DROP TABLE questions;


CREATE TABLE questions (
  question_id serial PRIMARY KEY,
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
  question_id int REFERENCES questions (question_id),
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

CREATE INDEX questions_by_pid_reported_index ON questions (product_id, reported);
CREATE INDEX answers_by_qid_reported_index ON answers (question_id, reported);
CREATE INDEX answerphotos_by_answer_id_index ON answerphotos (answer_id);

SELECT setval(pg_get_serial_sequence('questions', 'question_id'), 3518963);
SELECT setval(pg_get_serial_sequence('answers', 'id'), 6879306);
SELECT setval(pg_get_serial_sequence('answerphotos', 'id'), 2063759);