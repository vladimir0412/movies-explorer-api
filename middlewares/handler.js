const { ServerErrorCode } = require('../errors/statusCodes');

module.exports = (error, req, res, next) => {
  if (error.statusCode) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(ServerErrorCode).send({ message: 'Произошла ошибка сервера' });
  }
  next();
};
