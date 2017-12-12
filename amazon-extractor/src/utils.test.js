const { classToStars } = require('./utils');

describe('classToStars', () => {
  test('can parse stars', () => {
    const input = 'a-icon a-icon-star a-star-5 review-rating';
    const out = classToStars(input);

    expect(out).toBe(5);
  });

  test('can parse stars', () => {
    const input = 'a-icon a-icon-star a-star-1 review-rating';
    const out = classToStars(input);

    expect(out).toBe(1);
  });
});
