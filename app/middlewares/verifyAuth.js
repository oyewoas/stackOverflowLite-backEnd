import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const encrypted = jwt.verify(token, process.env.JWT_KEY);
    req.userData = encrypted;
    next();
  } catch (e) {
    res.status(401).json({
      status: '401',
      message: 'Auth failed',
      error: e,
    });
  }
};
