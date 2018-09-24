// Nothing is using this yet
import pool from './pool';


const createTables = () => {
  pool.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, display_name VARCHAR(200) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, no_questions BIGINT DEFAULT 0, no_answers BIGINT DEFAULT 0, joined TIMESTAMP NOT NULL)',
    () => {

    });
  pool.query('CREATE TABLE IF NOT EXISTS login(id SERIAL PRIMARY KEY, email VARCHAR(150) UNIQUE NOT NULL, password VARCHAR(150) NOT NULL)',
    () => {
    });
  pool.query('CREATE TABLE IF NOT EXISTS questions(quest_id SERIAL PRIMARY KEY, quest_asked_user_id INTEGER NOT NULL REFERENCES users(id), quest_title TEXT NOT NULL, quest_body TEXT NOT NULL, quest_asked_date TIMESTAMP)',
    () => {
    });
  pool.query('CREATE TABLE IF NOT EXISTS answers(ans_id SERIAL PRIMARY KEY, ans_given_user_id INTEGER NOT NULL REFERENCES users(id), quest_asked_id INTEGER NOT NULL REFERENCES questions(quest_id), ans_body TEXT NOT NULL, ans_accepted BOOLEAN DEFAULT false, ans_given_date TIMESTAMP NOT NULL)',
    () => {
    });
  pool.query('CREATE TABLE IF NOT EXISTS comments(comment_id SERIAL PRIMARY KEY, comment_user_id INTEGER NOT NULL REFERENCES users(id), ans_comment_id INTEGER NOT NULL REFERENCES answers(ans_id), comment_body TEXT NOT NULL, comment_given_date TIMESTAMP NOT NULL)',
    () => {
    });
};

export default createTables;
