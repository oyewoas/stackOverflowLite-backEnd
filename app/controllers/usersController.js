import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db/pool';
import { validateEmail, validatePassword, isEmpty } from './validate';

dotenv.config();

const badRequest = { status: '400', message: 'Bad Request' };


const loginQuery = (req, res, login) => {
  pool.query('SELECT * FROM users WHERE email = ($1)', [req.body.email], (error, dbRes) => {
    if (error) {
      // console.log(error);
      const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not Log User in' };
      res.status(500).send(replyServer);
    } else {
      const reply = { status: '401', message: 'User does not exist' };
      if (dbRes.rows[0] === undefined) {
        res.status(401).send(reply);
      } else {
        bcrypt.compare(req.body.password, dbRes.rows[0].password,
          (bcryptError, bcryptRes) => {
            if (bcryptError) {
              res.status(401).send(reply);
            } else if (bcryptRes) {
              const token = jwt.sign(
                {
                  email: dbRes.rows[0].email,
                  userId: dbRes.rows[0].user_id,
                },
                process.env.JWT_KEY,
                {
                  expiresIn: '4h',
                },
              );
              if (login) {
                const replyGood = { status: '200', message: 'User Logged In Successfully' };
                replyGood.token = token;
                replyGood.user_id = dbRes.rows[0].user_id;
                res.status(200).send(replyGood);
              } else {
                const replyCreate = { status: '201', message: 'User Created Successfully' };
                replyCreate.token = token;
                replyCreate.user_id = dbRes.rows[0].user_id;
                res.status(201).send(replyCreate);
              }
            } else {
              // reply.message = 'Unable to encrypt password';
              res.status(401).send(reply);
            }
          });
      }
    }
  });
};

const logIn = (req, res) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    // const badReq = { status: '400', message: 'Email or password field cannot be empty' };
    // badRequest.description = 'Email or password field cannot be empty';
    res.status(400).send(badRequest);
  } else if (validateEmail(email) && validatePassword(password)) {
    loginQuery(req, res, true);
  } else if (!validateEmail(email) || !validatePassword(password)) {
    const replyServer = { status: '400', message: 'Invalid email or password' };
    res.status(400).send(replyServer);
  }
};


const createUser = (req, res) => {
  const { displayname, email, password } = req.body;
  const joinDate = new Date();
  if (isEmpty(displayname) || isEmpty(email) || isEmpty(password)) {
    badRequest.description = 'Email, password or username field cannot be empty';
    res.status(400).send(badRequest);
  } else {
    pool.query('SELECT * FROM users WHERE email = ($1)', [email], (err, dbRes) => {
      if (err) {
        const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not create user' };
        res.status(500).send(replyServer);
      } else {
        const reply = { status: '409', message: 'User Already Exists' };
        if (dbRes.rows[0] === undefined) {
          bcrypt.hash(password, 10, (errBcrypt, hash) => {
            if (errBcrypt) {
              res.status(500).json({
                message: 'could not encrypt password',
              });
            } else if (validateEmail(email) && validatePassword(password)) {
            	( async () => {
            		const client = await pool.connect();
            		try {
            			await client.query('BEGIN');
            			const { rows } = await client.query('INSERT INTO users(display_name, email, joined) values($1, $2, $3) RETURNING email', [displayname, email, joinDate]);

            			const insertIntoLogin = 'INSERT INTO Login( email, password ) values($1, $2)';
            			const insertLoginValues = [res.rows[0].email, hash];
            			await client.query(insertIntoLogin, insertLoginValues);
            			await client.query('COMMIT');
            		} catch (e) {
            			await client.query('ROLLBACK');
            			throw e;
            		} finally {
            			client.release();
            		}
            	})().catch(e => console.error('Error Creating User Login', e.stack));
               // pool.query('INSERT INTO users(display_name, email, joined) values($1, $2, $3)',
              //   [displayname, email, joinDate], (errRes) => {
              //     if (errRes) {
              //       const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not create user' };
              //       res.status(500).send(replyServer);
              //     } else {
              //       loginQuery(req, res, false);
              //     }
              //   });
            } else if (!validateEmail(email) || !validatePassword(password)) {
              const replyServer = { status: '400', message: 'Invalid email or password' };
              res.status(400).send(replyServer);
            }
          });
        } else {
          res.status(409).send(reply);
        }
      }
    });
  }
};

const getProfile = (req, res) => {
  pool.query('SELECT display_name, email FROM users WHERE id = ($1)', [req.userData.userId], (err, res) => {
    if (err) {
      const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not create user' };
      res.status(500).send(replyServer);
    } else {
      const reply = { status: '404', message: 'User Does not exist' };
      if (res.rows[0] === undefined) {
        res.status(404).send(reply);
      } else {
        const goodReply = { status: '200', message: 'User Returned Successfully', user: res.rows[0] };
        res.status(200).send(goodReply);
      }
    }
  });
};

const updateProfile = (req, res) => {
  const { displayname, email, password } = req.body;
  if (isEmpty(displayname) || isEmpty(email) || !validateEmail(email)) {
    badRequest.description = 'Email or username field cannot be empty';
    res.status(400).send(badRequest);
  } else {
    pool.query('SELECT * FROM users WHERE email = ($1)', [email], (selectErr, res) => {
      if (selectErr) {
        const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not create user' };
        res.status(500).send(replyServer);
      } else {
        const replyBad = { status: '409', message: 'User Already Exists' };
        if (res.rows[0] === undefined) {
          pool.query('UPDATE users SET displayname = ($1), email = ($2) WHERE id = $3',
            [displayname, email, req.userData.userId], (updateErr) => {
              if (updateErr) {
                const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not update profile' };
                res.status(500).send(replyServer);
              } else {
                pool.query('SELECT displayname, email FROM users WHERE id = ($1)', [req.userData.userId], (err, dbRes) => {
                  if (err) {
                    const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve updated profile' };
                    res.status(500).send(reply);
                  } else {
                  // const db = { entries: dbRes.rows, size: dbRes.rows.length };
                    const reply = { status: '404', message: 'User Not Found' };
                    if (dbRes.rows === undefined) {
                      res.status(404).send(reply);
                    } else {
                      const goodReply = { status: '200', message: 'Profile Modified successfully', profile: dbRes.rows[0] };
                      res.status(200).send(goodReply);
                    }
                  }
                });
              }
            });
        } else {
          res.status(409).send(replyBad);
        }
      }
    });
  }
};

const updateDisplayName = (req, res) => {
  const { displayname, email } = req.body;
  if (isEmpty(displayname) || isEmpty(email) || !validateEmail(email)) {
    badRequest.description = 'Email or username field cannot be empty or invalid email';
    res.status(400).send(badRequest);
  } else {
    pool.query('UPDATE users SET displayname = ($1), email = ($2) WHERE id = $3',
      [displayname, email, req.userData.userId], (err) => {
        if (err) {
          const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not update profile' };
          res.status(500).send(replyServer);
        } else {
          pool.query('SELECT email, username FROM users WHERE user_id = ($1)', [req.userData.userId], (err, dbRes) => {
            if (err) {
              const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve updated profile' };
              res.status(500).send(reply);
            } else {
            // const db = { entries: dbRes.rows, size: dbRes.rows.length };
              const reply = { status: '404', message: 'User Not Found' };
              if (dbRes.rows === undefined) {
                res.status(404).send(reply);
              } else {
                const goodReply = { status: '200', message: 'Profile Modified successfully', profile: dbRes.rows[0] };
                res.status(200).send(goodReply);
              }
            }
          });
        }
      });
  }
};

export {
  createUser, logIn, getProfile, updateProfile, updateDisplayName,
};
