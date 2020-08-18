import Knex from 'knex';
import db from '../database/connection';

class ClassesRepository {
  queryBySubjectInWeekDayAtTime(
    subject: string | null,
    week_day: number | null,
    time: number | null,
  ): Knex.QueryBuilder {
    const query = db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id');

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
}

export default ClassesRepository;
