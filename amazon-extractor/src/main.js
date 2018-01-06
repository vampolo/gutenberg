const jsonfile = require('jsonfile');
const fs = require('fs');

const { getReviewsForProduct } = require('./parser');
const { uploadFile } = require('./storage');

// const products = ['B01MTG6NRC', 'B001E5BDS8', 'B075Z43GRW', 'B0769T3N5Z', 'B07471C38C'];
const products = ['B01MTG6NRC'];

const OUTPUT_TO_GOOGLE_STORAGE = true;

(async () => {
  // const bb8 = 'B01MTG6NRC';
  // const zippo = 'B001E5BDS8';
  // const iphone7Case = 'B075Z43GRW';
  // const pixel2Case = 'B0769T3N5Z';
  // const pixel2Case319 = 'B07471C38C';

  // const product = bb8;

  for(let product of products) {
    const reviews = await getReviewsForProduct(product);

    const filename = `../out/${product}.json`;

    jsonfile.writeFileSync(filename, {
      product: product,
      count: reviews.length,
      reviews: reviews,
    });

    if (OUTPUT_TO_GOOGLE_STORAGE) {
      await uploadFile(filename);

      fs.unlinkSync(filename);
    }
  }
})();
