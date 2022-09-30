require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { errors, Joi, celebrate } = require('celebrate');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const ServerError = require('./errors/ServerError');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();
const NotFound = require('./errors/NotFound');

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/diplomadb', {
  useNewUrlParser: true,
});

app.use(cors());
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

app.use('*', (req, res, next) => {
  next(new NotFound('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use((error, req, res, next) => {
  if (error.statusCode) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(ServerError).send({ message: 'Произошла ошибка' });
  }
  next();
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
