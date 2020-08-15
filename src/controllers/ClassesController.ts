import { Request, Response } from 'express';

import { badImplementation } from '@hapi/boom';
import paginationLinks from '../helpers/paginationLinks';
import db from '../database/connection';
import convertStringHourToMinutes from '../utils/convertStringHourToMinutes';
import ClassesRepository from '../repositories/ClassesRepository';

const classesRepository = new ClassesRepository();

export default class ClassesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { current_url } = request;
    const { week_day, subject, time } = request.query;
    const limit = 10;
    const page = Number(request.query.page) || 1;

    const timeInMinutes = convertStringHourToMinutes(String(time));

    const query = () =>
      db('classes')
        .whereExists(function () {
          this.select('class_schedule.*')
            .from('class_schedule')
            .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
            .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
            .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
            .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
        })
        .where('classes.subject', '=', String(subject))
        .join('users', 'classes.user_id', '=', 'users.id');

    const classes = await query()
      .limit(limit)
      .offset((page - 1) * limit)
      .select(['classes.*', 'users.*']);

    const [count] = await query().count();
    response.header('X-Total-Count', count['count(*)']);

    const pages_total = Math.ceil(count['count(*)'] / limit);

    if (pages_total > 1) {
      response.links(paginationLinks(page, pages_total, current_url));
    }

    return response.json(classes);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const createClassAndProffy = new CreateClassAndProffy();
    await createClassAndProffy.execute(request.body);

    return response.sendStatus(201);
  }
}
