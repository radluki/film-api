
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Internal Server Error',
    error: err.message
  });
};