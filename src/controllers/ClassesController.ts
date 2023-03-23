import { Request, Response } from 'express';

import paginationLinks from '../helpers/paginationLinks';
import { convertStringHourToMinutes } from '../utils/convertStringHourToMinutes';
import { CreateOrUpdateClassService } from '../services/CreateOrUpdateClassService';
import { ClassesRepository } from '../repositories/ClassesRepository';
import { GetUserClassService } from '../services/GetUserClassService';
import { GetClassesService } from '../services/GetClassesService';

interface CustomRequest {
  query: {
    subject: string;
    week_day: number;
    time: string;
  };
}

const classesRepository = new ClassesRepository();

export class ClassesController {
  async index(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const { hostUrl, currentUrl } = request;
    const page = Number(request.query.page) || 1;
    const limit = 10;

    const { week_day, subject, time } = request.query;
    const time_in_minutes = time ? convertStringHourToMinutes(time) : null;

    const getClassesService = new GetClassesService(classesRepository);
    const { count, classes } = await getClassesService.execute({
      limit,
      page,
      subject,
      week_day,
      time_in_minutes,
    });

    response.header('X-Total-Count', count);

    const pagesTotal = Math.ceil(parseInt(count, 10) / limit);
    if (pagesTotal > 1) {
      response.links(paginationLinks(page, pagesTotal, currentUrl));
    }

    return response.json(
      classes.map(classItem => ({
        ...classItem,
        url: `${currentUrl}/${classItem.id}`,
        user_url: `${hostUrl}/v1/users/${classItem.user_id}`,
      })),
    );
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const getUserClassService = new GetUserClassService();
    const classItem = await getUserClassService.execute({ user_id: id });

    return response.json(classItem);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { cost, subject, schedules } = request.body;
    const { id: user_id } = request.user;

    const createOrUpdateClassService = new CreateOrUpdateClassService();
    await createOrUpdateClassService.execute({
      user_id,
      cost,
      subject,
      schedules,
    });

    return response.sendStatus(204);
  }
}
