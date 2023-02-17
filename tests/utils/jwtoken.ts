import jwt from 'jsonwebtoken';

export default (id: number): string => {
  return jwt.sign({ id }, String(process.env.JWT_SECRET), {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};
