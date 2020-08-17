import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { hash } from 'bcryptjs';

import db from '../database/connection';
class UserController {
  async store(request: Request, response: Response): Promise<Response> {
    const {
      email,
      password,
      name,
      surname,
      avatar,
      whatsapp,
      bio,
    } = request.body;
    const user = await db('users').where('email', email).first();

    if (user) {
      throw badRequest('Email already in use', { code: 240 });
    }
    await db('users').insert({
      email,
      password: await hash(password, 8),
      name,
      surname,
      avatar,
      whatsapp,
      bio,
    });

    return response.sendStatus(204);
  }
}

export default UserController;
