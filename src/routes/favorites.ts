import { Router } from 'express';

import { FavoritesController } from '../controllers/FavoritesController';
import favoritedValidator from '../validators/favoritedValidator';
import pageValidator from '../validators/pageValidator';

const favoritesController = new FavoritesController();

const app = Router();

app.get('/', pageValidator, favoritesController.index);
app.post('/', favoritedValidator, favoritesController.store);

export default app;
