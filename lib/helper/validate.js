module.exports = (schema, value) => {
  const { error } = schema.validate(value);
  if (error) {
    throw error;
  }
};
