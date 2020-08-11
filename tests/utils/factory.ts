import factory from 'factory-girl';
import faker from 'faker';

factory.define(
  'User',
  {},
  {
    id: faker.random.number,
    name: faker.name.findName,
    avatar: faker.image.imageUrl,
    whatsapp: faker.phone.phoneNumber,
    bio: faker.lorem.paragraph,
  },
);

factory.define(
  'Class',
  {},
  {
    id: faker.random.number,
    subject: faker.name.title,
    cost: () => Number(faker.finance.amount()),
    user_id: faker.random.number,
  },
);

factory.define('ClassSchedule', {}, () => {
  const from = faker.random.number({ min: 0, max: 23 });
  const to = faker.random.number({ min: from + 1, max: 24 });

  return {
    id: faker.random.number,
    week_day: () => faker.random.number({ min: 0, max: 6 }),
    from: from * 60,
    to: to * 60,
    class_id: faker.random.number,
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
