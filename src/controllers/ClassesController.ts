import { Request, Response } from 'express';

import paginationLinks from '../helpers/paginationLinks';
import { convertStringHourToMinutes } from '../utils/convertStringHourToMinutes';
import { CreateOrUpdateClassService } from '../services/CreateOrUpdateClassService';
import { ClassesRepository } from '../repositories/ClassesRepository';
import { GetClassService } from '../services/GetClassService';

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
    const { hostUrl, currentUrl } = request;
    const page = Number(request.query.page) || 1;
    const limit = 10;

    const { week_day, subject, time } = request.query;
    const timeInMinutes = time ? convertStringHourToMinutes(time) : null;

    const classes = await classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, timeInMinutes)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );
    const classesSerialized = await classesRepository.getClassesSchedules(
      classes,
    );

    const count = await classesRepository.countBySubjectInWeekDayAtTime(
      subject,
      week_day,
      timeInMinutes,
    );
    response.header('X-Total-Count', count);

    const pages_total = Math.ceil(parseInt(count, 10) / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(page, pages_total, currentUrl));
    }

    return response.json(
      classesSerialized.map(classItem => ({
        ...classItem,
        url: `${currentUrl}/${classItem.id}`,
        user_url: `${hostUrl}/v1/users/${classItem.user_id}`,
      })),
    );
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { hostUrl, currentUrl } = request;
    const { id } = request.params;

    const getClassService = new GetClassService();
    const classItem = await getClassService.execute({ id });

    return response.json({
      ...classItem,
      url: currentUrl,
      user_url: `${hostUrl}/v1/users/${classItem.user_id}`,
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
