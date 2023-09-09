import factory from 'factory-girl';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

factory.define(
  'User',
  {},
  {
    email: faker.internet.email,
    password: async () => {
      const hashedPassword = await hash(faker.internet.password(), 8);
      return hashedPassword;
    },
    name: faker.person.fullName,
    surname: faker.person.lastName,
    avatar: faker.image.url,
    whatsapp: faker.phone.number,
    bio: faker.lorem.paragraph,
  },
);

factory.define(
  'Class',
  {},
  {
    subject: faker.person.jobArea,
    cost: () => Number(faker.finance.amount()),
    user_id: faker.number.int,
  },
);

factory.define('ClassSchedule', {}, () => {
  const from = faker.number.int({ min: 0, max: 23 });
  const to = faker.number.int({ min: from + 1, max: 24 });

  return {
    week_day: () => faker.number.int({ min: 0, max: 6 }),
    from: from * 60,
    to: to * 60,
  };
});

factory.define(
  'Connection',
  {},
  {
    user_id: faker.number.int,
  },
);

export default factory;
