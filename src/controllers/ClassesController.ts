import { Request, Response } from 'express';

import paginationLinks from '../helpers/paginationLinks';
import convertStringHourToMinutes from '../utils/convertStringHourToMinutes';
import CreateClassAndProffy from '../services/CreateClassAndProffy';
import ClassesRepository from '../repositories/ClassesRepository';

const classesRepository = new ClassesRepository();

class ClassesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { current_url } = request;
    const page = Number(request.query.page) || 1;
    const limit = 10;

    const { week_day, subject, time } = request.query;
    const timeInMinutes = convertStringHourToMinutes(String(time));

    const classes = await classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, timeInMinutes)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(['classes.*', 'users.*']);

    const [count] = await classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, timeInMinutes)
      .count();
    response.header('X-Total-Count', count['count(*)']);

    const pages_total = Math.ceil(count['count(*)'] / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(page, pages_total, current_url));
    }

    return response.json(classes);
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { host_url, current_url } = request;
    const { id } = request.params;

    const getClassService = new GetClassService();
    const classItem: SerializedClass = await getClassService.execute({ id });

    return response.json({
      ...classItem,
      url: current_url,
      user_url: `${host_url}/v1/users/${classItem.user_id}`,
    });
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { bio, whatsapp, cost, subject, schedules } = request.body;
    const { id: user_id } = request.user;

    const createOrUpdateClassService = new CreateOrUpdateClassService();
    await createOrUpdateClassService.execute({
      user_id,
      bio,
      whatsapp,
      cost,
      subject,
      schedules,
    });

    return response.sendStatus(204);
  }
}
export default ClassesController;
