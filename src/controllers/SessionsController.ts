import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';

import { db } from '../database/sql';

export class SessionsController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const user = await db('users').where('email', email).first();

    if (!user) {
      throw badRequest('User not exists', { code: 344 });
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      throw badRequest('User and/or password not match', { code: 340 });
    }

    return response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
      token: jwt.sign({ id: user.id }, String(process.env.JWT_SECRET), {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }),
    });
  }
}
