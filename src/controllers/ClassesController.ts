import { Request, Response } from 'express';

import paginationLinks from '../helpers/paginationLinks';
import convertStringHourToMinutes from '../utils/convertStringHourToMinutes';
import CreateClassAndProffy from '../services/CreateClassAndProffy';
import ClassesRepository from '../repositories/ClassesRepository';

interface CustomRequest {
  query: {
    subject: string;
    week_day: number;
    time: string;
  };
}

const classesRepository = new ClassesRepository();

class ClassesController {
  async index(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const page = Number(request.query.page) || 1;
    const limit = 10;

    const { week_day, subject, time } = request.query;
    const timeInMinutes = time ? convertStringHourToMinutes(time) : null;

    const classes = await classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, timeInMinutes)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(['classes.*', 'users.*']);

    const [count] = await classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, timeInMinutes)
      .count();
    response.header('X-Total-Count', count['count(*)']);

    const pages_total = Math.ceil(parseInt(count, 10) / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(page, pages_total, current_url));
    }

    return response.json(classes);
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { host_url, current_url } = request;
    const { id } = request.params;

    const getClassService = new GetClassService();
    const classItem = await getClassService.execute({ id });

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
