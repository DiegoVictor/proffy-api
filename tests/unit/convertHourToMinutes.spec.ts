import convertHourToMinutes from '../../src/utils/convertHourToMinutes';

describe('convertHourToMinutes', () => {
  it('should be able to convert hour to minutes', () => {
    const hour = convertHourToMinutes('9:00');
    expect(hour).toBe(540);
  });
});
