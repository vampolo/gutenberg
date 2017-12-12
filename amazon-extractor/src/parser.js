const puppeteer = require('puppeteer');
const { createLogger, format, transports } = require('winston');
const { classToStars } = require('./utils');

const logger = createLogger({
  transports: [
    new transports.Console(),
  ],
  format: format.combine(
    format.colorize({ all: true }),
    format.simple(),
    format.splat(),
  ),
});

const TOTAL_REVIEW_SELECTOR = '[data-hook="total-review-count"]';
const REVIEW_SECTION_SELECTOR = '.reviews-content';
const REVIEW_SELECTOR = '[data-hook="review"]';

const TITLE_SELECTOR = '[data-hook="review-title"]';
const STAR_SELECTOR = '[data-hook="review-star-rating"]';
const BODY_SELECTOR = '[data-hook="review-body"]';
const DATE_SELECTOR = '[data-hook="review-date"]';
const AUTHOR_SELECTOR = '[data-hook="review-author"]';

const CURRENT_PAGE_SELECTOR = '[data-hook="pagination-bar"] .a-selected > a';
const NEXT_PAGE_SELECTOR = '[data-hook="pagination-bar"] .a-last:not(.a-disabled) > a';

const show = async page => { await page.screenshot({ path: 'show.png' }); logger.info("Took screenshot")};

const random = (min=0, max=1) => Math.floor(Math.random()*(max-min+1)+min);

const parseReviewInPage = async (page, i) => {
  const title = await page.evaluate(({sel, i}) => {
    return document.querySelectorAll(sel)[i].innerHTML;
  }, {sel: TITLE_SELECTOR, i});

  const stars = await page.evaluate(({sel, i}) => {
    return document.querySelectorAll(sel)[i].getAttribute('class');
  }, {sel: STAR_SELECTOR, i});

  const body = await page.evaluate(({sel, i}) => {
    return document.querySelectorAll(sel)[i].innerHTML;
  }, {sel: BODY_SELECTOR, i});

  const date = await page.evaluate(({sel, i}) => {
    return document.querySelectorAll(sel)[i].innerHTML.slice(3);
  }, {sel: DATE_SELECTOR, i});

  const author =  await page.evaluate(({sel, i}) => {
    const el = document.querySelectorAll(sel)[i];
    return {
      name: el.innerHTML,
      link: el.getAttribute('href'),
    };
  }, {sel: AUTHOR_SELECTOR, i});

  return {
    title,
    stars,
    body,
    date,
    author,
  };
};

const getReviewsInPage = async page => {
  const listLength = await page.evaluate((sel) => {
    return document.querySelectorAll('[data-hook="review"]').length;
  }, REVIEW_SELECTOR);

  if (listLength !== 10) {
    await show(page);
  }

  const list = [...Array(listLength).keys()];

  const reviews = ( await Promise.all(list.map(async i => await parseReviewInPage(page, i))) ).map(r => ({
    ...r,
    stars: classToStars(r.stars)
  }));

  logger.info(`There are ${listLength} reviews and we collected ${reviews.length}`);

  return reviews;
};

const navigateToNextPage = async page => {
  try {
    await page.waitForSelector(NEXT_PAGE_SELECTOR, { visible: true });
  } catch (e) {
    logger.info(`Exception in looking for next page selector. error: ${e}`);
    return false;
  }

  logger.info("Loading Next Page");
  await page.click(NEXT_PAGE_SELECTOR);
  return true;
};

const getReviewsForProduct = async product => {
  const browser = await puppeteer.launch({
    // headless: false,
  });

  const page = await browser.newPage();
  await page.setViewport({width: 1024, height: 768});

  await page.goto(`https://www.amazon.com/dp/${product}`);

  await page.waitForSelector(TOTAL_REVIEW_SELECTOR, { visible: true });
  const reviewsCount = Number.parseInt((await page.$eval(TOTAL_REVIEW_SELECTOR, el => el.textContent)).replace(/,/g, ''), 10);
  await page.click(TOTAL_REVIEW_SELECTOR);

  let cont = true;
  const reviews = [];
  let pageReviews;
  let currentPage;

  while(cont) {
    await page.waitForSelector(REVIEW_SECTION_SELECTOR, { visible: true });
    await page.waitForSelector(CURRENT_PAGE_SELECTOR, { visible: true });

    currentPage = Number.parseInt(await page.$eval(CURRENT_PAGE_SELECTOR, el => el.textContent), 10);
    logger.info(`Current page is ${currentPage}`);

    await page.waitFor(random(1000, 5000));
    pageReviews = await getReviewsInPage(page);
    reviews.push(...pageReviews);

    logger.info(`Current reviewCount ${reviews.length}`);

    if (reviews.length >= reviewsCount) {
      logger.info('Exiting main loop');
      break;
    }

    cont = await navigateToNextPage(page);
  }

  await browser.close();

  logger.info(`Total Reviews: ${reviewsCount}. Total captured reviews: ${reviews.length}`);

  return reviews;
};


module.exports = {
  getReviewsForProduct
};
