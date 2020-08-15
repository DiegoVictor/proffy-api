import { Request, Response } from 'express';

import paginationLinks from '../helpers/paginationLinks';
import convertStringHourToMinutes from '../utils/convertStringHourToMinutes';
import ClassesRepository from '../repositories/ClassesRepository';

const classesRepository = new ClassesRepository();

export default class ClassesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { current_url } = request;
    const page = Number(request.query.page) || 1;
    const limit = 10;

    const { week_day, subject, time } = request.query;
    const timeInMinutes = convertStringHourToMinutes(String(time));

    const classes = await classesRepository
      .getQueryBySubjectInWeekDayAtTime(
        String(subject),
        Number(week_day),
        timeInMinutes,
      )
      .limit(limit)
      .offset((page - 1) * limit)
      .select(['classes.*', 'users.*']);

    const [count] = await classesRepository
      .getQueryBySubjectInWeekDayAtTime(
        String(subject),
        Number(week_day),
        timeInMinutes,
      )
      .count();
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
