import { notFound } from '@hapi/boom';

import { db } from '../database/sql';

interface Request {
  user_id: number;
  data: {
    name?: string;
    surname?: string;
    avatar?: string;
    whatsapp?: string;
    bio?: string;
  };
}

export class UpdateUserService {
  public async execute({ user_id, data }: Request): Promise<void> {
    const user = await db('users').where('id', user_id).first();

    if (!user) {
      throw notFound('User not found', { code: 244 });
    }

    await db('users').where({ id: user_id }).update(data);
  }
}
