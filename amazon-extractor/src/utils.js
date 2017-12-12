
const classToStars = classNames => {
  const regex = /.*a-star-(\d).*/g;
  const result = regex.exec(classNames);
  return Number.parseInt(result[1], 10);
};

module.exports = {
  classToStars
};
