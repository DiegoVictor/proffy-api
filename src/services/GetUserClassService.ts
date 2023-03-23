import { notFound } from '@hapi/boom';

import { db } from '../database/sql';

interface Request {
  user_id: string | number;
}

interface SerializedClass {
  id: number;
  subject: string;
  cost: number;
  schedules: {
    week_day: number;
    from: string;
    to: string;
  }[];
}

export class GetUserClassService {
  public async execute({ user_id }: Request): Promise<SerializedClass> {
    const classItem = await db('classes')
      .where('classes.User_id', user_id)
      .select('classes.id as id', 'classes.subject', 'classes.cost')
      .first();

    if (!classItem) {
      throw notFound('Class not found', { code: 144 });
    }

    const schedules = await db('class_schedule')
      .where('class_id', classItem.id)
      .select('week_day', 'from', 'to', 'class_id');

    return {
      ...classItem,
      schedules,
    };
  }
}
