import { Router } from 'express';

import { ClassesController } from '../controllers/ClassesController';
import classFiltersValidator from '../validators/classFiltersValidator';
import classValidator from '../validators/classValidator';
import pageValidator from '../validators/pageValidator';

const classesController = new ClassesController();

const app = Router();

app.get('/', classFiltersValidator, pageValidator, classesController.index);
app.get('/my-class', classesController.show);
app.post('/', classValidator, classesController.store);

export default app;
