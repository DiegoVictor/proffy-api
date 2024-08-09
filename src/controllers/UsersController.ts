import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { hash } from 'bcryptjs';

import { db } from '../database/sql';
import { GetUserService } from '../services/GetUserService';
import { UpdateUserService } from '../services/UpdateUserService';

export class UsersController {
  async show(request: Request, response: Response): Promise<Response> {
    const { hostUrl, currentUrl } = request;
    const { id } = request.params;

    const getUserService = new GetUserService();
    const user = await getUserService.execute({
      id: id ?? request.user?.id?.toString(),
    });

    return response.json({
      ...user,
      url: currentUrl,
      class_url: `${hostUrl}/v1/classes/${user.class_id}`,
    });
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { email, password, name, surname, avatar, whatsapp, bio } =
      request.body;
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

    return response.sendStatus(201);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { name, surname, avatar, whatsapp, bio } = request.body;
    const { id: user_id } = request.user;

    const updateUserService = new UpdateUserService();
    await updateUserService.execute({
      user_id,
      data: { name, surname, avatar, whatsapp, bio },
    });

    return response.sendStatus(204);
  }
}
