import { verify } from 'jsonwebtoken';
import { badRequest, badImplementation } from '@hapi/boom';
import { hash } from 'bcryptjs';

import db from '../database/connection';
import auth from '../config/auth';

interface Request {
  token: string;
  password: string;
}

interface Token {
  iat: number;
  exp: number;
  id: string;
}

class ResetPasswordService {
  public async execute({ token, password }: Request): Promise<void> {
    let userId: string;
    try {
      const decoded = verify(token, auth.secret);
      const { id } = decoded as Token;
      userId = id;
    } catch (err) {
      throw badRequest('Token invalid or expired', { code: 540 });
    }

    const user = await db('users').where('id', userId).first();

    if (!user) {
      throw badRequest('Invalid token', { code: 542 });
    }

    try {
      db('users')
        .where('id', user.id)
        .update({
          password: await hash(password, 8),
        });
    } catch (err) {
      throw badImplementation(
        'An unexpected error while updating the user occured',
        { code: 550 },
      );
    }
  }
}

export default ResetPasswordService;
