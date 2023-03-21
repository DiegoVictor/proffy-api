import { notFound } from '@hapi/boom';

import { db } from '../database/sql';

interface Request {
  id: string;
}

interface SerializedClass {
  id: number;
  user_id?: number;
  subject: string;
  cost: number;
  schedules: {
    week_day: number;
    from: string;
    to: string;
  }[];
}

export class GetOneClassService {
  public async execute({ id }: Request): Promise<SerializedClass> {
    const classItem = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .where('classes.id', id)
      .select(
        'classes.id as id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
      )
      .first();

    if (!classItem) {
      throw notFound('Class not found', { code: 144 });
    }

    const schedules = await db('class_schedule')
      .where('class_id', id)
      .select('week_day', 'from', 'to', 'class_id');

    return {
      ...classItem,
      schedules,
    };
  }
}
