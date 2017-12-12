const jsonfile = require('jsonfile');

const { getReviewsForProduct } = require('./parser');

(async () => {
  const bb8 = 'B01MTG6NRC';
  const zippo = 'B001E5BDS8';
  const iphone7Case = 'B075Z43GRW';
  const pixel2Case = 'B0769T3N5Z';
  const pixel2Case319 = 'B07471C38C';

  const product = bb8;

  const reviews = await getReviewsForProduct(product);

  jsonfile.writeFileSync(`${product}.json`, {
    product: product,
    count: reviews.length,
    reviews: reviews,
  });
})();
