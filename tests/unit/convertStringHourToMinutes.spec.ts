import { convertStringHourToMinutes } from '../../src/utils/convertStringHourToMinutes';

describe('convertStringHourToMinutes', () => {
  it('should be able to convert hour to minutes', () => {
    const hour = convertStringHourToMinutes('9:00');
    expect(hour).toBe(540);
  });
});
