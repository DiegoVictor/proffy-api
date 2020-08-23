import Knex from 'knex';
import db from '../database/sql';

interface Class {
  id: number;
  user_id: number;
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
  url?: string;
  user_url?: string;
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

class ClassesRepository {
  queryBySubjectInWeekDayAtTime(
    subject: string | null,
    week_day: number | null,
    time: number | null,
  ): Knex.QueryBuilder {
    const query = db('classes').join(
      'users',
      'classes.user_id',
      '=',
      'users.id',
    );

    if (subject) {
      query.where('classes.subject', '=', subject);
    }

    if (week_day) {
      query.whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [week_day]);
      });
    }

    if (time) {
      query.whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`from` <= ??', [time])
          .whereRaw('`class_schedule`.`to` > ??', [time]);
      });
    }

    return query;
  }

  async countBySubjectInWeekDayAtTime(
    subject: string | null,
    week_day: number | null,
    time: number | null,
  ): Promise<string> {
    const [count] = await this.queryBySubjectInWeekDayAtTime(
      subject,
      week_day,
      time,
    ).count();
    return count['count(*)'];
  }

  async getClassesSchedules(classes: Class[]): Promise<SerializedClass[]> {
    const schedules = await db('class_schedule')
      .whereIn(
        'class_id',
        classes.map(classItem => classItem.id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const classesSerialized = classes.map(classItem => {
      return {
        ...classItem,
        schedules: schedules.filter(
          schedule => schedule.class_id === classItem.id,
        ),
      };
    });

    return classesSerialized;
  }
}

export default ClassesRepository;
