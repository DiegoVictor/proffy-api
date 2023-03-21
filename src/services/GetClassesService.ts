import { ClassesRepository } from '../repositories/ClassesRepository';

interface Request {
  limit: number;
  page: number;
  subject: string;
  week_day: number;
  time_in_minutes: number | null;
}

interface SerializedClass {
  count: string;
  classes: {
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
  }[];
}

export class GetClassesService {
  constructor(private classesRepository: ClassesRepository) {}

  public async execute({
    limit,
    page,
    subject,
    week_day,
    time_in_minutes,
  }: Request): Promise<SerializedClass> {
    const classes = await this.classesRepository
      .queryBySubjectInWeekDayAtTime(subject, week_day, time_in_minutes)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );

    const classesSerialized = await this.classesRepository.getClassesSchedules(
      classes,
    );

    const count = await this.classesRepository.countBySubjectInWeekDayAtTime(
      subject,
      week_day,
      time_in_minutes,
    );

    return {
      count,
      classes: classesSerialized,
    };
  }
}
