import Knex from 'knex';
import db from '../database/connection';

class ClassesRepository {
  getQueryBySubjectInWeekDayAtTime(
    subject: string,
    week_day: number,
    time: number,
  ): Knex.QueryBuilder {
    return db('classes')
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [week_day])
          .whereRaw('`class_schedule`.`from` <= ??', [time])
          .whereRaw('`class_schedule`.`to` > ??', [time]);
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id');
  }
}

export default ClassesRepository;
