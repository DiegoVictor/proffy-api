import factory from 'factory-girl';
import faker from 'faker';

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

export default factory;
