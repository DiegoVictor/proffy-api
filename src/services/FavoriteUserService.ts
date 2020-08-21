import { badRequest } from '@hapi/boom';

import db from '../database/connection';

interface Request {
  user_id: number;
  favorited_user_id: number;
}

class FavoriteUserService {
  public async execute({ user_id, favorited_user_id }: Request): Promise<void> {
    if (user_id === favorited_user_id) {
      throw badRequest('You can not favorite yourself', { code: 440 });
    }

    const favorited = await db('favorites')
      .where('user_id', user_id)
      .where('favorited_user_id', favorited_user_id)
      .first();

    if (!favorited) {
      const users = await db('users').whereIn('id', [
        user_id,
        favorited_user_id,
      ]);

      if (users.length !== 2) {
        throw badRequest('Users not match', { code: 444 });
      }

      await db('favorites').insert({ user_id, favorited_user_id });
    }
  }
}

export default FavoriteUserService;
