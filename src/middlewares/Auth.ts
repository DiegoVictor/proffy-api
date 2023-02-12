import jwt from 'jsonwebtoken';
import { badRequest, unauthorized } from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';

interface Token {
  iat: number;
  exp: number;
  id: string;
}

export default async (
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  const { authorization } = request.headers;

  if (!authorization) {
    throw badRequest('Token not provided', { code: 543 });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, String(process.env.JWT_SECRET));
    const { id } = decoded as Token;

    request.user = { id: parseInt(id, 10) };

    next();
  } catch (err) {
    throw unauthorized('Token invalid or expired', 'sample', { code: 541 });
  }
};
