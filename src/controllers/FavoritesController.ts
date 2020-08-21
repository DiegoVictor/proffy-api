import { Request, Response } from 'express';

import FavoriteUserService from '../services/FavoriteUserService';
class FavoritesController {

  async store(request: Request, response: Response): Promise<Response> {
    const { user_id: favorited_user_id } = request.body;
    const { id: user_id } = request.user;

    const favoriteUserService = new FavoriteUserService();
    await favoriteUserService.execute({ user_id, favorited_user_id });

    return response.sendStatus(204);
  }
}

export default FavoritesController;
