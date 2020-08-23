import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { hash } from 'bcryptjs';

import db from '../database/sql';
import GetUserService from '../services/GetUserService';

class UserController {
  async show(request: Request, response: Response): Promise<Response> {
    const { host_url, current_url } = request;
    const { id } = request.params;

    const getUserService = new GetUserService();
    const user = await getUserService.execute({ id });

    return response.json({
      ...user,
      url: current_url,
      class_url: `${host_url}/v1/classes/${user.class_id}`,
    });
  }

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
