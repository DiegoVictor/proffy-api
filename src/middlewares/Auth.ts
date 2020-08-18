import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { badRequest, unauthorized } from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';

import auth from '../config/auth';

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
    const decoded = await promisify(jwt.verify)(token, auth.secret);
    const { id } = decoded as Token;
    request.user = { id: parseInt(id, 10) };

    next();
  } catch (err) {
    throw unauthorized('Token invalid', 'sample', { code: 541 });
  }
};
