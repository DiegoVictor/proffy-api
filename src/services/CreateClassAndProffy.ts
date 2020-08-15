import { badImplementation } from '@hapi/boom';
import db from '../database/connection';
import convertStringHourToMinutes from '../utils/convertStringHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

interface Request {
  name: string;
  avatar: string;
  whatsapp: string;
  bio: string;
  subject: string;
  cost: string;
  schedule: ScheduleItem[];
}

class CreateClassAndProffy {
  async execute({
    name,
    avatar,
    whatsapp,
    bio,
    subject,
    cost,
    schedule,
  }: Request): Promise<void> {
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
        from: convertStringHourToMinutes(scheduleItem.from),
        to: convertStringHourToMinutes(scheduleItem.to),
      }));

      await trx('class_schedule').insert(classSchedule);
      await trx.commit();
    } catch (err) {
      await trx.rollback();

      throw badImplementation('Unexpected error while creating new classes', {
        code: 150,
      });
    }
  }
}

export default CreateClassAndProffy;
