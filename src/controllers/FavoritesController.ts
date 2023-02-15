import { Request, Response } from 'express';

import { db } from '../database/sql';
import { FavoriteUserService } from '../services/FavoriteUserService';
import paginationLinks from '../helpers/paginationLinks';
import { FavoritesRepository } from '../repositories/FavoritesRepository';

interface Favorite {
  id: number;
  whatsapp: string;
  name: string;
  surname: string;
  class_id: number;
  user_id: number;
  favorited_user_id: number;
  bio: string;
  avatar: string;
  subject: string;
  cost: number;
}

export class FavoritesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { hostUrl, currentUrl } = request;
    const page = Number(request.query.page) || 1;
    const limit = 10;
    const { id } = request.user;

    const favoritesRepository = new FavoritesRepository();
    const favorites: Favorite[] = await favoritesRepository
      .queryMyFavorites(id)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(
        'favorites.user_id',
        'favorites.favorited_user_id',
        'users.id as id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as class_id',
        'classes.subject',
        'classes.cost',
      );

    const schedules = await db('class_schedule')
      .whereIn(
        'class_id',
        favorites.map(favorite => favorite.class_id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const favoritesSerialized = favorites.map(favorite => {
      return {
        ...favorite,
        schedules: schedules.filter(
          schedule => schedule.class_id === favorite.class_id,
        ),
        user_url: `${hostUrl}/v1/users/${id}`,
        class_url: `${hostUrl}/v1/classes/${favorite.class_id}`,
      };
    });

    const count = await favoritesRepository.countBySubjectInWeekDayAtTime(id);
    response.header('X-Total-Count', count);

    const pages_total = Math.ceil(parseInt(count, 10) / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(page, pages_total, currentUrl));
    }

    return response.json(favoritesSerialized);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { user_id: favorited_user_id } = request.body;
    const { id: user_id } = request.user;

    const favoriteUserService = new FavoriteUserService();
    await favoriteUserService.execute({ user_id, favorited_user_id });

    return response.sendStatus(204);
  }
}
