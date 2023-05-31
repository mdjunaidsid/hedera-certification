module.exports = (number, position) => {
  if (position === 0) {
    return number;
  }
  return (number / 10 ** position).toFixed(position);
};
