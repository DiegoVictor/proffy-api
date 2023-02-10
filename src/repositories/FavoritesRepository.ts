import Knex from 'knex';

import { db } from '../database/sql';

class FavoritesRepository {
  queryMyFavorites(id: number): Knex.QueryBuilder {
    const query = db('favorites')
      .join('users', 'favorites.favorited_user_id', '=', 'users.id')
      .join('classes', 'users.id', '=', 'classes.user_id')
      .where('favorites.user_id', id);

    return query;
  }

  async countBySubjectInWeekDayAtTime(id: number): Promise<string> {
    const [count] = await this.queryMyFavorites(id).count();
    return count['count(*)'];
  }
}

export default FavoritesRepository;
