import { notFound } from '@hapi/boom';
import db from '../database/connection';

interface Request {
  id: string;
}

interface Class {
  id: number;
  whatsapp: string;
  name: string;
  surname: string;
  bio: string;
  avatar: string;
  subject: string;
  cost: number;
  week_day: number;
  from: string;
  to: string;
}

interface SerializedClass {
  id: number;
  user_id?: number;
  whatsapp: string;
  name: string;
  surname: string;
  bio: string;
  avatar: string;
  subject: string;
  cost: number;
  schedules: {
    week_day: number;
    from: string;
    to: string;
  }[];
}

class GetClassService {
  public async execute({ id }: Request): Promise<SerializedClass> {
    const classItem = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id')
      .where('classes.id', id)
      .select(
        'users.id as user_id',
        'users.email',
        'users.name',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as id',
        'classes.subject',
        'classes.cost',
        'class_schedule.week_day',
        'class_schedule.from',
        'class_schedule.to',
      )
      .then((rows: Class[]) => {
        let result: SerializedClass | undefined;

        rows.forEach(row => {
          const { week_day: weekDay, from, to, ...props } = row;
          const schedule = { week_day: weekDay, from, to };

          if (result) {
            result.schedules.push(schedule);
          } else {
            result = {
              ...props,
              schedules: [schedule],
            };
          }
        });

        return result;
      });

    if (!classItem) {
      throw notFound('Class not found', { code: 144 });
    }

    return classItem;
  }
}

export default GetClassService;
