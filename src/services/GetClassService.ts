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
      .where('classes.id', id)
      .select(
        'classes.id as id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.email',
        'users.name',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
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

export default GetClassService;
