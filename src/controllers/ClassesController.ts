import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertStringHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { week_day, subject, time } = request.query;

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
    return response.json(classes);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    } = request.body;

    const trx = await db.transaction();

    try {
      const [user_id] = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });
      const [class_id] = await trx('classes').insert({
        subject,
        cost,
        user_id,
      });
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => ({
        class_id,
        week_day: scheduleItem.week_day,
        from: convertHourToMinutes(scheduleItem.from),
        to: convertHourToMinutes(scheduleItem.to),
      }));

      await trx('class_schedule').insert(classSchedule);
      await trx.commit();

      return response.sendStatus(201);
    } catch (err) {
      await trx.rollback();

      return response.status(400).json({
        message: 'Unexpected error while creating new classes',
      });
    }
  }
}
