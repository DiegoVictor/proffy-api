import { badImplementation, notFound } from '@hapi/boom';

import { db } from '../database/sql';
import { convertStringHourToMinutes } from '../utils/convertStringHourToMinutes';

interface Schedule {
  week_day: number;
  from: string;
  to: string;
}

interface Request {
  user_id: number;
  bio: string;
  whatsapp: string;
  cost: number;
  subject: string;
  schedules: Schedule[];
}

export class CreateOrUpdateClassService {
  public async execute({
    user_id,
    bio,
    whatsapp,
    cost,
    subject,
    schedules,
  }: Request): Promise<void> {
    const user = await db('users').where('id', user_id).first();
    if (!user) {
      throw notFound('User not found', { code: 141 });
    }

    const trx = await db.transaction();
    try {
      if (user.bio !== bio || user.whatsapp !== whatsapp) {
        await trx('users').where('id', user_id).update({
          bio,
          whatsapp,
        });
      }

      let class_id: number;
      const classItem = await trx('classes').where('user_id', user_id).first();
      if (classItem) {
        class_id = classItem.id;
        if (classItem.cost !== cost || classItem.subject !== subject) {
          await trx('classes').where('user_id', user_id).update({
            cost,
            subject,
          });
        }
        await trx('class_schedule').where('class_id', classItem.id).delete();
      } else {
        const [classItemId] = await trx('classes').insert({
          user_id,
          cost,
          subject,
        });
        class_id = classItemId;
      }

      const schedulesSerialized = schedules.map((scheduleItem: Schedule) => ({
        class_id,
        week_day: scheduleItem.week_day,
        from: convertStringHourToMinutes(scheduleItem.from),
        to: convertStringHourToMinutes(scheduleItem.to),
      }));

      await trx('class_schedule').insert(schedulesSerialized);
      await trx.commit();
    } catch (err) {
      await trx.rollback();

      throw badImplementation('Unexpected error while update new classes', {
        code: 150,
      });
    }
  }
}
