import jwt from 'jsonwebtoken';
const jwtSecret =process.env.TOKEN_KEY

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token,jwtSecret);
};

export { generateToken, verifyToken };
