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
    name: faker.name.findName,
    surname: faker.name.lastName,
    avatar: faker.image.imageUrl,
    whatsapp: faker.phone.phoneNumber,
    bio: faker.lorem.paragraph,
  },
);

factory.define(
  'Class',
  {},
  {
    subject: faker.name.title,
    cost: () => Number(faker.finance.amount()),
    user_id: faker.random.number,
  },
);

factory.define('ClassSchedule', {}, () => {
  const from = faker.random.number({ min: 0, max: 23 });
  const to = faker.random.number({ min: from + 1, max: 24 });

  return {
    week_day: () => faker.random.number({ min: 0, max: 6 }),
    from: from * 60,
    to: to * 60,
  };
});

factory.define(
  'Connection',
  {},
  {
    user_id: faker.random.number,
  },
);

export default factory;
